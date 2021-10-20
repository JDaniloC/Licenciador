export default function GetRemaining(milliseconds: number): string {
    const timestamp = milliseconds - (new Date().getTime() / 1000);
    let message = "Sua licença expirou."
    
    if (timestamp > 0) {
        message = "Sua licença dura"

        const years = Math.floor(timestamp / 31104000)
        const months = Math.floor(timestamp / 2592000)
        const days = Math.floor(timestamp / 86400)
        const hours = Math.floor(timestamp / 3600) % 24
        const minutes = Math.floor(timestamp / 60) % 60
        const seconds = timestamp % 60

        if (years > 0) {
            const plural = years > 1 ? "s" : "";
            return `${message} ${years} ano${plural}.`
        } else if (months > 0) {
            const plural = years > 1 ? "meses" : "mês";
            return `${message} ${months} ${plural}.`
        } else if (days > 0) {
            const plural = years > 1 ? "s" : "";
            return `${message} ${days} dia${plural}.`
        } else if (hours > 0) {
            const plural = years > 1 ? "s" : "";
            return `${message} ${hours} hora${plural}.`
        } else if (minutes > 0) {
            const plural = years > 1 ? "s" : "";
            return `${message} ${minutes} minuto${plural}.`
        } else {
            const plural = years > 1 ? "s" : "";
            return `${message} ${seconds} segundo${plural}.`
        }
    } 
    return message;
}