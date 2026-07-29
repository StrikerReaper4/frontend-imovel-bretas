import Input from "./Input";
import Button from "./Button";
import { useState, useEffect } from "react";

const CURRENCY_SYMBOL = {
  Brasil: "R$",
  "Estados Unidos": "U$",
  Portugal: "€",
};

function FilterCard({ admin, onFilter }) {
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState(["Qualquer"]);
  const [filter, setFilter] = useState({
    id_imovel: "",
    tipo: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "",
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    de: 0,
    ate: 0,
  });

  if (admin === undefined) admin = false;

  // Símbolo da moeda baseado no país selecionado
  const currencySymbol = CURRENCY_SYMBOL[filter.pais] || null;

  // Preço só pode ser filtrado quando um país está selecionado
  const priceDisabled = !filter.pais || filter.pais === "Qualquer";

  const buscarCidades = async () => {
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filter.estado}/municipios`
      );
      const data = await res.json();
      const listaCidades = data
        .map((e) => e.nome)
        .sort((a, b) => a.localeCompare(b));
      setCidades(["Qualquer", ...listaCidades]);
    } catch (e) {
      console.error("Erro ao buscar cidades:", e);
    }
  };

  useEffect(() => {
    const buscarEstados = async () => {
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );
        const data = await res.json();
        const listaEstados = data
          .map((e) => e.sigla)
          .sort((a, b) => a.localeCompare(b));
        setEstados(["Qualquer", ...listaEstados]);
      } catch (err) {
        console.error("Erro ao buscar estados:", err);
      }
    };
    buscarEstados();
  }, []);

  useEffect(() => {
    if (filter.estado && filter.estado !== "Qualquer") buscarCidades();
    else setCidades(["Qualquer"]);
  }, [filter.estado]);

  // Quando o país muda, zera os campos de valor para evitar filtros inválidos
  const handlePaisChange = (newPais) => {
    setFilter({ ...filter, pais: newPais, estado: "", cidade: "", de: 0, ate: 0 });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const cleanedFilter = { ...filter };

    if (cleanedFilter.quartos === "+5") cleanedFilter.quartos = 5;
    if (cleanedFilter.banheiros === "+5") cleanedFilter.banheiros = 5;
    if (cleanedFilter.vagas === "+5") cleanedFilter.vagas = 5;

    ["tipo", "pais", "estado", "cidade"].forEach((key) => {
      if (cleanedFilter[key] === "Qualquer") cleanedFilter[key] = "";
    });

    // Se o país foi zerado, garante que de/ate também vão zerados
    if (!cleanedFilter.pais) {
      cleanedFilter.de = 0;
      cleanedFilter.ate = 0;
    }

    const numericFilter = {
      ...cleanedFilter,
      id_imovel: Number(cleanedFilter.id_imovel) || 0,
      quartos: Number(cleanedFilter.quartos) || 0,
      banheiros: Number(cleanedFilter.banheiros) || 0,
      vagas: Number(cleanedFilter.vagas) || 0,
      de: Number(cleanedFilter.de) || 0,
      ate: Number(cleanedFilter.ate) || 0,
    };

    onFilter(numericFilter);
  };

  return (
    <div className="bg-white w-full rounded-lg p-4 shadow-md text-center">
      <h2 className="title text-3xl mb-4">Filtragem</h2>
      <form>
        {admin && (
          <>
            <div className="flex flex-wrap gap-4">
              <Input
                type="number"
                label="Pesquisa por ID"
                wid="full"
                placeholder="Ex: 7344"
                value={filter.id_imovel}
                setValue={(newValue) =>
                  setFilter({ ...filter, id_imovel: newValue })
                }
              />
            </div>
            <hr className="my-2 text-gray-300" />
          </>
        )}

        {!admin && (
          <>
            <div className="flex flex-wrap gap-4">
              <Input
                type="text"
                label="Tipo de Imóvel"
                wid="150"
                select="true"
                selectOptions={["Qualquer", "Casa", "Apartamento", "Terreno"]}
                value={filter.tipo}
                setValue={(newValue) =>
                  setFilter({ ...filter, tipo: newValue })
                }
              />
            </div>
            <hr className="my-2 text-gray-300" />
          </>
        )}

        <div className="flex flex-wrap gap-4">
          <Input
            type="text"
            label="País"
            wid="full md:150"
            select="true"
            selectOptions={["Qualquer", "Brasil", "Estados Unidos", "Portugal"]}
            value={filter.pais}
            setValue={handlePaisChange}
          />

          {filter.pais === "Brasil" && (
            <>
              <Input
                type="text"
                label="Estado"
                wid="full md:150"
                select="true"
                selectOptions={estados}
                value={filter.estado}
                setValue={(newValue) =>
                  setFilter({ ...filter, estado: newValue })
                }
              />
              <Input
                type="text"
                label="Cidade"
                wid="140"
                select="true"
                selectOptions={cidades}
                value={filter.cidade}
                setValue={(newValue) =>
                  setFilter({ ...filter, cidade: newValue })
                }
              />
            </>
          )}

          <Input
            type="text"
            label="Bairro"
            wid="120"
            value={filter.bairro}
            setValue={(newValue) => setFilter({ ...filter, bairro: newValue })}
          />
        </div>

        <hr className="my-2 text-gray-300" />

        {/* Aviso quando nenhum país está selecionado */}
        {priceDisabled && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-2 text-left">
            ⚠️ Selecione um <strong>país</strong> para filtrar por valor — cada país usa uma moeda diferente.
          </p>
        )}

        <div className={`flex flex-wrap gap-4 ${priceDisabled ? "opacity-40 pointer-events-none" : ""}`}>
          <Input
            type="number"
            label={`Valor Mínimo${currencySymbol ? ` (${currencySymbol})` : ""}`}
            placeholder={currencySymbol ? `${currencySymbol} 1` : "Selecione o país"}
            wid="full md:150"
            value={filter.de}
            setValue={(newValue) => setFilter({ ...filter, de: newValue })}
          />
          <Input
            type="number"
            label={`Valor Máximo${currencySymbol ? ` (${currencySymbol})` : ""}`}
            placeholder={currencySymbol ? `${currencySymbol} 1.000.000` : "Selecione o país"}
            wid="full md:150"
            value={filter.ate}
            setValue={(newValue) => setFilter({ ...filter, ate: newValue })}
          />
        </div>

        {!admin && (
          <>
            <hr className="my-2 text-gray-300" />
            <div className="flex flex-wrap gap-4">
              <Input
                type="text"
                label="Quartos"
                wid="full md:150"
                select="true"
                selectOptions={["0", "1", "2", "3", "4", "+5"]}
                value={filter.quartos}
                setValue={(newValue) =>
                  setFilter({ ...filter, quartos: newValue })
                }
              />
              <Input
                type="text"
                label="Banheiros"
                wid="full md:150"
                select="true"
                selectOptions={["0", "1", "2", "3", "4", "+5"]}
                value={filter.banheiros}
                setValue={(newValue) =>
                  setFilter({ ...filter, banheiros: newValue })
                }
              />
              <Input
                type="text"
                label="Vagas"
                wid="full md:150"
                select="true"
                selectOptions={["0", "1", "2", "3", "4", "+5"]}
                value={filter.vagas}
                setValue={(newValue) =>
                  setFilter({ ...filter, vagas: newValue })
                }
              />
            </div>
          </>
        )}

        <Button
          label="Aplicar Filtros"
          wid="full"
          className="px-4 py-2 mt-4"
          onClick={handleApplyFilters}
        />
      </form>
    </div>
  );
}

export default FilterCard;
