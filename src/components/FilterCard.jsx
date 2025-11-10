import Input from "./Input";
import Button from "./Button";
import { filterImoveis } from "../services/imovelService";
import { useState, useEffect } from "react";

function FilterCard({ admin, onFilter }) {
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState(["Qualquer"]);
  const [filter, setFilter] = useState({
    id: "",
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
      console.error("Erro ao buscar cidades");
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

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const cleanedFilter = { ...filter };
    ["tipo", "pais", "estado", "cidade"].forEach((key) => {
      if (cleanedFilter[key] === "Qualquer") cleanedFilter[key] = "";
    });
    const numericFilter = {
      ...cleanedFilter,
      quartos: Number(cleanedFilter.quartos) || 0,
      banheiros: Number(cleanedFilter.banheiros) || 0,
      vagas: Number(cleanedFilter.vagas) || 0,
      de: Number(cleanedFilter.de) || 0,
      ate: Number(cleanedFilter.ate) || 0,
    };
    const fetchFilters = async () => {
      const imoveis = await filterImoveis(numericFilter);
      onFilter(imoveis);
      if (imoveis.length === 0) alert("Nenhum imóvel encontrado.");
    };
    fetchFilters();
  };

  return (
    <div className="bg-white w-full rounded-lg p-4 shadow-md text-center">
      <h2 className="title text-3xl mb-4">Filtragem</h2>
      <form>
        <div className={`${admin ? "" : "hidden"} flex flex-wrap gap-4`}>
          <Input
            type="number"
            label="Pesquisa por ID"
            wid="full"
            placeholder="Ex: 7344"
            value={filter.id}
            setValue={(newValue) => setFilter({ ...filter, id: newValue })}
          />
        </div>
        <hr className={`${admin ? "" : "hidden"} my-2 text-gray-300`} />
        <div className={`${admin ? "hidden" : ""} flex flex-wrap gap-4`}>
          <Input
            type="text"
            label="Tipo de Imóvel"
            wid="150"
            select="true"
            selectOptions={["Qualquer", "Casa", "Apartamento", "Terreno"]}
            value={filter.tipo}
            setValue={(newValue) => setFilter({ ...filter, tipo: newValue })}
          />
        </div>
        <hr className={`${admin ? "hidden" : ""} my-2 text-gray-300`} />
        <div className="flex flex-wrap gap-4">
          <Input
            type="text"
            label="País"
            wid="full md:150"
            select="true"
            selectOptions={["Qualquer", "Brasil", "Estados Unidos", "Portugal"]}
            value={filter.pais}
            setValue={(newValue) =>
              setFilter({
                ...filter,
                pais: newValue,
                estado: "",
                cidade: "",
              })
            }
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
        <div className="flex flex-wrap gap-4">
          <Input
            type="number"
            label="Valor Mínimo"
            placeholder="R$ 1"
            wid="full md:150"
            value={filter.de}
            setValue={(newValue) => setFilter({ ...filter, de: newValue })}
          />
          <Input
            type="number"
            label="Valor Máximo"
            placeholder="R$ 1,000,000"
            wid="full md:150"
            value={filter.ate}
            setValue={(newValue) => setFilter({ ...filter, ate: newValue })}
          />
        </div>
        <hr className={`my-2 text-gray-300 ${admin ? "hidden" : ""}`} />
        <div className={`flex flex-wrap gap-4 ${admin ? "hidden" : ""}`}>
          <Input
            type="number"
            label="Quartos"
            wid="full md:150"
            select="true"
            selectOptions={[0, 1, 2, 3, 4, 5]}
            value={filter.quartos}
            setValue={(newValue) => setFilter({ ...filter, quartos: newValue })}
          />
          <Input
            type="number"
            label="Banheiros"
            wid="full md:150"
            select="true"
            selectOptions={[0, 1, 2, 3, 4, 5]}
            value={filter.banheiros}
            setValue={(newValue) =>
              setFilter({ ...filter, banheiros: newValue })
            }
          />
          <Input
            type="number"
            label="Vagas"
            wid="full md:150"
            select="true"
            selectOptions={[0, 1, 2, 3, 4, 5]}
            value={filter.vagas}
            setValue={(newValue) => setFilter({ ...filter, vagas: newValue })}
          />
        </div>
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
