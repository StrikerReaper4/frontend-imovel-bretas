import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { alterarSenha, criarAdmin } from "../services/userService";
import { apiErrorMessage } from "../services/api";

const SENHA_MINIMA = 8;

function Feedback({ erro, sucesso }) {
  if (erro) return <p className="text-red-600 text-sm mt-2">{erro}</p>;
  if (sucesso) return <p className="text-green-700 text-sm mt-2">{sucesso}</p>;
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
    <form onSubmit={enviar} className="flex flex-col gap-2 mt-2">
      <Input type="password" label="Senha atual" wid="full" value={form.atual}
        setValue={(v) => setForm({ ...form, atual: v })} />
      <Input type="password" label="Nova senha" wid="full" value={form.nova}
        placeholder={`Mínimo ${SENHA_MINIMA} caracteres`}
        setValue={(v) => setForm({ ...form, nova: v })} />
      <Input type="password" label="Confirmar nova senha" wid="full" value={form.confirma}
        setValue={(v) => setForm({ ...form, confirma: v })} />
      <Feedback erro={erro} sucesso={sucesso} />
      <Button label={enviando ? "Salvando..." : "Alterar senha"} wid="full"
        className="p-2 mt-2" disabled={enviando} onClick={enviar} />
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
    <form onSubmit={enviar} className="flex flex-col gap-2 mt-2">
      <Input type="text" label="Nome" wid="full" value={form.nome}
        setValue={(v) => setForm({ ...form, nome: v })} />
      <Input type="email" label="Email" wid="full" value={form.email}
        placeholder="Usado para entrar e recuperar a senha"
        setValue={(v) => setForm({ ...form, email: v })} />
      <Input type="password" label="Senha" wid="full" value={form.senha}
        placeholder={`Mínimo ${SENHA_MINIMA} caracteres`}
        setValue={(v) => setForm({ ...form, senha: v })} />
      <Input type="password" label="Confirmar senha" wid="full" value={form.confirma}
        setValue={(v) => setForm({ ...form, confirma: v })} />
      <Feedback erro={erro} sucesso={sucesso} />
      <Button label={enviando ? "Criando..." : "Criar admin"} wid="full"
        className="p-2 mt-2" disabled={enviando} onClick={enviar} />
    </form>
  );
}
