import "../src/database";
import Perfil from "../src/models/Perfil";

(async () => {
    const docs = await Perfil.find({ wallet: { $exists: true } });
    for (const d of docs) {
        d.wallet = String(d.wallet).toLowerCase();
        await d.save();
    }
    console.log(`✅ OK: normalizadas ${docs.length} carteiras`);
    process.exit(0);
})();
