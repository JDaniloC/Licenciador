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
            return `${message} ${years} anos.`
        } else if (months > 0) {
            return `${message} ${months} meses.`
        } else if (days > 0) {
            return `${message} ${days} dias.`
        } else if (hours > 0) {
            return `${message} ${hours} horas.`
        } else if (minutes > 0) {
            return `${message} ${minutes} minutos.`
        } else {
            return `${message} ${seconds} segundos.`
        }
    } 
    return message;
}