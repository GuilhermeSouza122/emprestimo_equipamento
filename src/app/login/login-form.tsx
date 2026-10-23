"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";

import { Icon } from "../_components/nocturne/icons";
import styles from "./login.module.css";

const subscribeToHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type FieldErrors = { email?: string; password?: string };

export function LoginForm() {
  // Keep the form disabled until submit interception is available, including
  // when JavaScript is disabled. This interface must never send credentials.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailRef.current;
    const password = passwordRef.current;
    if (!email || !password) return;

    const nextErrors: FieldErrors = {};
    if (!email.value.trim()) nextErrors.email = "Informe seu e-mail.";
    else if (!email.validity.valid) nextErrors.email = "Informe um e-mail válido.";
    if (!password.value) nextErrors.password = "Informe sua senha.";

    setErrors(nextErrors);
    setFeedback("");
    if (nextErrors.email) {
      email.focus();
      return;
    }
    if (nextErrors.password) {
      password.focus();
      return;
    }

    setFeedback("O acesso ainda não está disponível. A autenticação será conectada em uma próxima etapa; nenhum dado foi enviado.");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} method="post" noValidate aria-labelledby="login-title" aria-describedby="login-availability">
      <p className={styles.availability} id="login-availability">
        <Icon name="info" size={16} />
        <span><strong>Autenticação em desenvolvimento.</strong> Esta tela ainda não permite entrar no sistema.</span>
      </p>
      <noscript><p className={styles.feedback}>Ative o JavaScript para interagir com esta prévia.</p></noscript>

      <fieldset className={styles.fieldset} disabled={!hydrated}>
        <legend className={styles.srOnly}>Dados de acesso</legend>
        <div className={styles.field}>
          <label htmlFor="login-email">E-mail</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}><Icon name="envelope" size={16} /></span>
            <input ref={emailRef} id="login-email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="voce@empresa.com" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} onChange={() => { setErrors((previous) => ({ ...previous, email: undefined })); setFeedback(""); }} />
          </div>
          {errors.email ? <p className={styles.error} id="login-email-error" role="alert">{errors.email}</p> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password">Senha</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}><Icon name="lock" size={16} /></span>
            <input ref={passwordRef} className={styles.passwordInput} id="login-password" name="password" type={passwordVisible ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} onChange={() => { setErrors((previous) => ({ ...previous, password: undefined })); setFeedback(""); }} />
            <button className={styles.passwordToggle} type="button" aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={passwordVisible} aria-controls="login-password" onClick={() => setPasswordVisible((visible) => !visible)}>
              <Icon name={passwordVisible ? "eye-off" : "eye"} size={16} />
            </button>
          </div>
          {errors.password ? <p className={styles.error} id="login-password-error" role="alert">{errors.password}</p> : null}
        </div>

        <button className={styles.submit} type="submit">Entrar <Icon name="arrow-right" size={16} /></button>
      </fieldset>

      <div aria-live="polite" aria-atomic="true">
        {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
      </div>
    </form>
  );
}
