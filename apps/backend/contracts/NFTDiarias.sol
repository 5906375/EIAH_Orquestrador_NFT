// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NFTDiarias is ERC721URIStorage, AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    uint256 private _tokenIdTracker;

    // dono do imóvel por imovelId
    mapping(uint256 => address) public propertyOwner;
    // operadores aprovados por imovelId
    mapping(uint256 => mapping(address => bool)) public propertyOperator;

    struct Reservation {
        uint256 imovelId;
        uint64 startDate; // epoch (segundos)
        uint64 endDate;   // epoch (segundos)
        address guest;    // carteira do hóspede (destinatário do NFT)
        bool paid;        // true quando pagamento confirmado
        bool canceled;    // true se reserva cancelada
        bool completed;   // true após check-out e burn
    }

    // tokenId => dados da reserva
    mapping(uint256 => Reservation) public reservations;

    // índice para checar disponibilidade (lista de tokens por imovelId)
    mapping(uint256 => uint256[]) private propertyReservations; // imovelId => tokenIds ativos/históricos
    mapping(uint256 => uint256) private tokenIndexInProperty;   // tokenId => index+1 na lista acima

    event PropertyOwnerSet(uint256 indexed imovelId, address indexed owner);
    event PropertyOperatorSet(uint256 indexed imovelId, address indexed operator, bool approved);
    event ReservationMinted(uint256 indexed tokenId, uint256 indexed imovelId, address indexed guest, uint64 startDate, uint64 endDate);
    event ReservationPaid(uint256 indexed tokenId, bool paid);
    event ReservationCanceled(uint256 indexed tokenId);
    event ReservationCompleted(uint256 indexed tokenId);

    constructor() ERC721("NFTDiarias", "NFTD") {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /* =========================
            Modificadores
       ========================= */

    modifier onlyOwnerOrAdmin(uint256 imovelId) {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || msg.sender == propertyOwner[imovelId],
            "Not admin/owner"
        );
        _;
    }

    modifier onlyOwnerOrOperator(uint256 imovelId) {
        require(
            hasRole(ADMIN_ROLE, msg.sender) ||
            msg.sender == propertyOwner[imovelId] ||
            propertyOperator[imovelId][msg.sender],
            "Not authorized"
        );
        _;
    }

    /* =========================
              Admin/Owner
       ========================= */

    // ADMIN da plataforma define/atualiza o dono de um imovelId
    function setPropertyOwner(uint256 imovelId, address owner) external onlyRole(ADMIN_ROLE) {
        require(owner != address(0), "Owner zero");
        propertyOwner[imovelId] = owner;
        emit PropertyOwnerSet(imovelId, owner);
    }

    // Owner do imovelId (ou ADMIN) aprova/revoga um operador (corretor/gestor)
    function setPropertyOperator(uint256 imovelId, address operator_, bool approved)
        external
        onlyOwnerOrAdmin(imovelId)
    {
        require(operator_ != address(0), "Operator zero");
        propertyOperator[imovelId][operator_] = approved;
        emit PropertyOperatorSet(imovelId, operator_, approved);
    }

    /* =========================
            Disponibilidade
       ========================= */

    function isAvailable(uint256 imovelId, uint64 startDate, uint64 endDate) public view returns (bool) {
        require(startDate < endDate, "Invalid range");
        uint256[] memory list = propertyReservations[imovelId];
        for (uint256 i = 0; i < list.length; i++) {
            Reservation memory r = reservations[list[i]];
            if (r.canceled || r.completed) continue;
            // overlap: (start < r.end) && (end > r.start)
            if (startDate < r.endDate && endDate > r.startDate) {
                return false;
            }
        }
        return true;
    }

    /* =========================
             Reserva/NFT
       ========================= */

    // Somente owner ou operador do imovelId pode mintear a reserva
    function mintReservation(
        uint256 imovelId,
        address guest,
        uint64 startDate,
        uint64 endDate,
        string memory tokenURI_
    ) external onlyOwnerOrOperator(imovelId) returns (uint256) {
        require(guest != address(0), "Guest zero");
        require(startDate < endDate, "Invalid range");
        require(isAvailable(imovelId, startDate, endDate), "Not available");

        _tokenIdTracker += 1;
        uint256 newTokenId = _tokenIdTracker;

        _safeMint(guest, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);

        reservations[newTokenId] = Reservation({
            imovelId: imovelId,
            startDate: startDate,
            endDate: endDate,
            guest: guest,
            paid: false,
            canceled: false,
            completed: false
        });

        // indexação para disponibilidade
        propertyReservations[imovelId].push(newTokenId);
        tokenIndexInProperty[newTokenId] = propertyReservations[imovelId].length; // index+1

        emit ReservationMinted(newTokenId, imovelId, guest, startDate, endDate);
        return newTokenId;
    }

    // Confirmar pagamento (true) ou marcar como pendente/estornado (false)
    function setReservation(uint256 tokenId, bool paid_) external {
        _requireOwned(tokenId); // v5: garante que existe
        Reservation storage r = reservations[tokenId];
        // Somente owner/op/admin do imovelId
        require(
            hasRole(ADMIN_ROLE, msg.sender) ||
            msg.sender == propertyOwner[r.imovelId] ||
            propertyOperator[r.imovelId][msg.sender],
            "Not authorized"
        );
        require(!r.canceled && !r.completed, "Already canceled/completed");
        r.paid = paid_;
        emit ReservationPaid(tokenId, paid_);
    }

    // Cancelar reserva
    function cancelReservation(uint256 tokenId) external {
        _requireOwned(tokenId);
        Reservation storage r = reservations[tokenId];
        require(
            hasRole(ADMIN_ROLE, msg.sender) ||
            msg.sender == propertyOwner[r.imovelId] ||
            propertyOperator[r.imovelId][msg.sender],
            "Not authorized"
        );
        require(!r.canceled && !r.completed, "Already finalized");
        r.canceled = true;
        emit ReservationCanceled(tokenId);
    }

    // Concluir no check-out e queimar o token
    function completeAndBurn(uint256 tokenId) external {
        _requireOwned(tokenId);
        Reservation storage r = reservations[tokenId];
        require(
            hasRole(ADMIN_ROLE, msg.sender) ||
            msg.sender == propertyOwner[r.imovelId] ||
            propertyOperator[r.imovelId][msg.sender],
            "Not authorized"
        );
        require(!r.canceled && !r.completed, "Already finalized");
        require(block.timestamp >= r.endDate, "Stay not finished yet");

        r.completed = true;

        // remove do índice do imóvel (swap & pop)
        uint256 idxPlus = tokenIndexInProperty[tokenId];
        if (idxPlus > 0) {
            uint256 idx = idxPlus - 1;
            uint256[] storage list = propertyReservations[r.imovelId];
            uint256 last = list[list.length - 1];
            list[idx] = last;
            tokenIndexInProperty[last] = idx + 1;
            list.pop();
            delete tokenIndexInProperty[tokenId];
        }

        _burn(tokenId);
        emit ReservationCompleted(tokenId);
    }

    /* =========================
          Suporte de interface
       ========================= */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
