import { CommandTrigger } from '../constant';

export function addBulletSlashCommand(text: string, description: string): string {
    return `* \`/${CommandTrigger} ${text}\` - ${description}`;
}

export function h5(text: string): string {
    return `##### ${text}\n`;
}

export function h6(text: string): string {
    return `###### ${text}\n`;
}

export function joinLines(...lines: string[]): string {
    return lines.join('\n');
}

export function bold(text: string): string {
    return `**${text}**`;
}

export function hyperlink(text: string, url: string): string {
    return `[${text}](${url})`;
}

export function inLineImage(text: string, url: string): string {
    return `![${text}](${url})`;
}
