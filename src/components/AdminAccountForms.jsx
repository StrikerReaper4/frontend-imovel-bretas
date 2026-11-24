import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { alterarSenha, criarAdmin } from "../services/userService";
import { apiErrorMessage } from "../services/api";

const SENHA_MINIMA = 8;

function Feedback({ erro, sucesso }) {
  if (erro)
    return (
      <p
        role="alert"
        className="m-0 mt-1 border-l-2 border-red-700 bg-red-700/8 px-4 py-2.5 text-[14px] text-red-800"
      >
        {erro}
      </p>
    );
  if (sucesso)
    return (
      <p
        role="status"
        className="m-0 mt-1 border-l-2 border-gold bg-gold/10 px-4 py-2.5 text-[14px] text-gold-ink"
      >
        {sucesso}
      </p>
    );
  return null;
}

export function ChangePasswordForm({ onDone }) {
  const [form, setForm] = useState({ atual: "", nova: "", confirma: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    if (form.nova.length < SENHA_MINIMA)
      return setErro(`A nova senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    if (form.nova !== form.confirma) return setErro("As senhas não coincidem.");

    setEnviando(true);
    try {
      await alterarSenha(form.atual, form.nova);
      setSucesso("Senha alterada com sucesso!");
      setForm({ atual: "", nova: "", confirma: "" });
      setTimeout(onDone, 1500);
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível alterar a senha."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <Input type="password" label="Senha atual" wid="full" value={form.atual}
        placeholder="A senha que você usa hoje"
        setValue={(v) => setForm({ ...form, atual: v })} />
      <Input type="password" label="Nova senha" wid="full" value={form.nova}
        placeholder={`Mínimo ${SENHA_MINIMA} caracteres`}
        setValue={(v) => setForm({ ...form, nova: v })} />
      <Input type="password" label="Confirmar nova senha" wid="full" value={form.confirma}
        placeholder="Repita a nova senha"
        setValue={(v) => setForm({ ...form, confirma: v })} />
      <Feedback erro={erro} sucesso={sucesso} />
      <Button label={enviando ? "Salvando..." : "Alterar senha"} wid="full"
        className="mt-2" disabled={enviando} onClick={enviar} />
    </form>
  );
}

export function NewAdminForm({ onDone }) {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirma: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    if (!form.nome.trim() || !form.email.trim()) return setErro("Preencha nome e email.");
    if (form.senha.length < SENHA_MINIMA)
      return setErro(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    if (form.senha !== form.confirma) return setErro("As senhas não coincidem.");

    setEnviando(true);
    try {
      await criarAdmin({ nome: form.nome, email: form.email, senha: form.senha });
      setSucesso(`Admin ${form.email} criado! Ele já pode entrar pelo botão "Entrar".`);
      setForm({ nome: "", email: "", senha: "", confirma: "" });
      setTimeout(onDone, 2500);
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível criar o admin."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <Input type="text" label="Nome" wid="full" value={form.nome}
        placeholder="Nome de quem vai usar o painel"
        setValue={(v) => setForm({ ...form, nome: v })} />
      <Input type="email" label="Email" wid="full" value={form.email}
        placeholder="nome@bretasimoveis.cloud"
        dica="Serve para entrar e para recuperar a senha."
        setValue={(v) => setForm({ ...form, email: v })} />
      <Input type="password" label="Senha" wid="full" value={form.senha}
        placeholder={`Mínimo ${SENHA_MINIMA} caracteres`}
        setValue={(v) => setForm({ ...form, senha: v })} />
      <Input type="password" label="Confirmar senha" wid="full" value={form.confirma}
        placeholder="Repita a senha"
        setValue={(v) => setForm({ ...form, confirma: v })} />
      <Feedback erro={erro} sucesso={sucesso} />
      <Button label={enviando ? "Criando..." : "Criar admin"} wid="full"
        className="mt-2" disabled={enviando} onClick={enviar} />
    </form>
  );
}
