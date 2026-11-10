/** Hash scrypt no formato `scrypt$N$r$p$salt$chave` (base64). Nunca guarda a senha. */
export function hashSenha(senha: string): Promise<string>;

/** Compara em tempo constante. Devolve false para hash malformado, nunca lança por isso. */
export function verificarSenha(senha: string, armazenado: string): Promise<boolean>;
