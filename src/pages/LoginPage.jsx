import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const navigate = useNavigate();
  const [loginInfos, setLoginInfos] = useState({ usuario: "", senha: "" });

  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
        <div className="w-96 p-6 bg-white rounded-xl shadow-md">
          <img src="/logo-nobg.png" alt="Logo" className="h-25 mx-auto" />
          <Input
            type="text"
            label="Usuário"
            id="username"
            value={loginInfos.usuario}
            setValue={(newValue) =>
              setLoginInfos({ ...loginInfos, usuario: newValue })
            }
            placeholder="Digite seu usuário"
            className="mt-2"
          />
          <Input
            type="password"
            label="Senha"
            id="password"
            value={loginInfos.senha}
            setValue={(newValue) =>
              setLoginInfos({ ...loginInfos, senha: newValue })
            }
            placeholder="Digite sua senha"
            className="mt-2"
          />
          <Button
            label="Entrar"
            wid="full"
            className="p-2 mt-3"
            onClick={() => {
              navigate("/admin/logged");
            }}
          />
        </div>
      </div>
    </>
  );
}

export default LoginPage;
