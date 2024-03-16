export function env(name: string, defaultValue?: string): string {
    const passedValue = process.env[name];
    if (typeof passedValue === 'string') {
        return passedValue;
    } else if (typeof defaultValue === 'string') {
        return defaultValue;
    } else {
        throw new Error(`Environment variable "${name}" is required`);
    }
}
