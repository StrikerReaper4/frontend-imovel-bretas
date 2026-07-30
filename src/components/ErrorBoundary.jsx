import { Component } from "react";

// Rede de segurança: qualquer erro não tratado em qualquer componente cai aqui
// em vez de desmontar a aplicação e deixar a tela em branco.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Erro não tratado na aplicação:", error, info);
  }

  handleReload = () => {
    // Limpa o estado salvo antes de recarregar — se o erro veio de um estado
    // corrompido, recarregar sem limpar cairia no mesmo erro de novo.
    try {
      sessionStorage.clear();
    } catch {
      /* storage indisponível — recarrega mesmo assim */
    }
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F3F3] text-center px-4">
        <h1 className="text-3xl font-bold text-[#0f3e58] mb-3">
          Algo deu errado
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Tivemos um problema ao exibir esta página. Tente novamente — se
          continuar acontecendo, entre em contato conosco.
        </p>
        <button
          onClick={this.handleReload}
          className="bg-[#80703c] text-white py-2 px-6 rounded-full font-bold shadow-md hover:bg-[#6b5e33] transition"
        >
          Voltar ao início
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
