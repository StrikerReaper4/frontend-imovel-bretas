import { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { alterarSenha, criarAdmin, excluirAdmin, listarAdmins } from "../services/userService";
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

// Lista de administradores com exclusão. As regras de segurança ficam no
// backend (não excluir a si mesmo nem o último admin; os imóveis do excluído
// passam para quem excluiu) — aqui só mostramos e pedimos confirmação.
export function AdminsList() {
  const [admins, setAdmins] = useState([]);
  const [eu, setEu] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmar, setConfirmar] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregar = async () => {
    setCarregando(true);
    try {
      const { data } = await listarAdmins();
      setAdmins(data.admins || []);
      setEu(data.eu);
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível carregar os administradores."));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const excluir = async () => {
    if (!confirmar) return;
    setErro("");
    setSucesso("");
    setExcluindo(true);
    try {
      const { data } = await excluirAdmin(confirmar.id);
      const n = data.imoveis_transferidos || 0;
      setSucesso(
        `${confirmar.nome} foi excluído.` +
          (n > 0 ? ` ${n} ${n === 1 ? "imóvel passou" : "imóveis passaram"} para a sua conta.` : "")
      );
      setConfirmar(null);
      carregar();
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível excluir o administrador."));
    } finally {
      setExcluindo(false);
    }
  };

  if (carregando) return <p className="m-0 text-[15px] text-muted">Carregando…</p>;

  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 flex list-none flex-col p-0">
        {admins.map((a) => {
          const souEu = a.id === eu;
          return (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="m-0 truncate text-[15.5px] font-semibold text-ink">
                  {a.nome}
                  {souEu && <span className="ml-2 text-[13px] font-normal text-gold-ink">(você)</span>}
                </p>
                <p className="m-0 truncate text-[14px] text-muted">{a.email}</p>
              </div>
              {!souEu && admins.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setErro("");
                    setSucesso("");
                    setConfirmar(a);
                  }}
                  className="shrink-0 cursor-pointer text-[14px] font-semibold text-red-800 underline-offset-4 hover:underline"
                >
                  Excluir
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {admins.length <= 1 && (
        <p className="m-0 text-[14px] text-muted">
          Você é o único administrador. Crie outro em “Novo admin” antes de poder excluir contas.
        </p>
      )}

      {confirmar && (
        <div className="border border-red-700/40 bg-red-700/5 p-4">
          <p className="m-0 text-[15px] text-ink">
            Excluir <b>{confirmar.nome}</b> ({confirmar.email})? Ele não vai mais conseguir
            entrar no painel. Os imóveis cadastrados por ele passam para a sua conta.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              label={excluindo ? "Excluindo…" : `Excluir ${confirmar.nome}`}
              disabled={excluindo}
              onClick={excluir}
            />
            <Button label="Cancelar" variant="ghost" onClick={() => setConfirmar(null)} />
          </div>
        </div>
      )}

      <Feedback erro={erro} sucesso={sucesso} />
    </div>
  );
}
