export const secretTypes = ['text', 'image', 'file'] as const;

export type SecretType = (typeof secretTypes)[number];

export interface SecretMeta {
  type: SecretType;
  mime?: string;
  filename?: string;
  passphrase: string;
  date: number;
  ttl: number;
}
