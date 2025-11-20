import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Login } from "../services/userService";
function LoginPage() {
  const navigate = useNavigate();
  const [loginInfos, setLoginInfos] = useState({
    nome: "admin",
    email: "",
    senha: "",
    role: "admin",
  });
  const efetuarLogin = () => {
    try {
      const handleLogin = async () => {
        const response = await Login(loginInfos);
        console.log("resposta", response);
        if (response.status === 200) {
          localStorage.setItem("user", JSON.stringify(response.data));
          const expiryTime = Date.now() + 60 * 60 * 1000;
          localStorage.setItem("token_expiry", expiryTime);
          navigate("/admin/logged");
        }
      };
      handleLogin();
    } catch (error) {
      console.error(err);
    }
  };
  return (
    <>
      {" "}
      <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
        {" "}
        <div className="w-96 p-6 bg-white rounded-xl shadow-md">
          {" "}
          <img src="/logo-nobg.png" alt="Logo" className="h-25 mx-auto" />{" "}
          <Input
            type="email"
            label="Email"
            id="email"
            value={loginInfos.email}
            setValue={(newValue) =>
              setLoginInfos({ ...loginInfos, email: newValue })
            }
            placeholder="Digite seu email"
            className="mt-2"
          />{" "}
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
          />{" "}
          <Button
            label="Entrar"
            wid="full"
            className="p-2 mt-3"
            onClick={() => {
              efetuarLogin();
            }}
          />{" "}
        </div>{" "}
      </div>{" "}
    </>
  );
}
export default LoginPage;
