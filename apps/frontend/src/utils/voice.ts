export function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR"; // idioma
    utterance.rate = 1;       // velocidade
    speechSynthesis.speak(utterance);
}
