export default function GetRemaining(milliseconds: number): string {
    let timestamp = milliseconds - (new Date().getTime() / 1000);
    let message = "Sua licença expirou."
    
    if (timestamp > 0) {
        message = "Sua licença dura"
        while (timestamp > 60) {
            const years = Math.floor(timestamp / 31104000);
            const months = Math.floor(timestamp / 2592000);
            const days = Math.floor(timestamp / 86400);
            const hours = Math.floor(timestamp / 3600) % 24;
            const minutes = Math.floor(timestamp / 60) % 60;
            
            if (years > 0) {
                timestamp -= years * 31104000;
                const plural = years > 1 ? "s" : "";
                message = `${message} ${years} ano${plural},`
            } else if (months > 0) {
                timestamp -= months * 2592000;
                const plural = months > 1 ? "meses" : "mês";
                message = `${message} ${months} ${plural},`
            } else if (days > 0) {
                timestamp -= days * 86400;
                const plural = days > 1 ? "s" : "";
                message = `${message} ${days} dia${plural},`
            } else if (hours > 0) {
                timestamp -= hours * 3600;
                const plural = hours > 1 ? "s" : "";
                message = `${message} ${hours} hora${plural} e`
            } else if (minutes > 0) {
                timestamp -= minutes * 60;
                message = `${message} ${minutes}min.`
            }
        }
    } 
    return message;
}