

export function formatDate(time: string | number) {
    let parts = new Date(time).toLocaleDateString().split('/');
    for (let index = 0; index < parts.length; index++) {
        if (parseInt(parts[index]) < 10) {
            parts[index] = `0${parts[index]}`;
        }
    }
    return parts.join('/');
}

export function formatTime(time: string | number) {
    return new Date(time).toLocaleTimeString();
}