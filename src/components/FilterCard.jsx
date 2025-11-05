import Input from "./Input";
import Button from "./Button";
import { filterImoveis } from "../services/imovelService"
import { useState } from "react";


function FilterCard({ admin,onFilter }) {
  const [filter, setFilter] = useState({
    ind: "",
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

  if (admin === undefined) {
    admin = false;
  }
  
  const handleApplyFilters = (e) => {
    e.preventDefault();
    console.log(filter);
    if (filter.tipo === "Qualquer"){
      setFilter({...filter, tipo: ""})
    }
    if (filter.pais === "Qualquer"){
      setFilter({...filter, pais: ""})
    }
    if (filter.estado === "Qualquer"){
      setFilter({...filter, estado: ""})
    }
    if (filter.cidade === "Qualquer"){
      setFilter({...filter, cidade: ""})
    }
    /*Converter para Number */
    const numericFilter = {
      ...filter,
      quartos: Number(filter.quartos) || 0,
      banheiros: Number(filter.banheiros) || 0,
      vagas: Number(filter.vagas) || 0,
      de: Number(filter.de) || 0,
      ate: Number(filter.ate) || 0,
    };
    const fetchFilters = async () => {
      const imoveis = await filterImoveis(numericFilter);
      console.log(imoveis);
      onFilter(imoveis);
      if (imoveis.length === 0) {
        alert("Nenhum imovel encontrado");
        window.location.reload();
      }
    }
    fetchFilters();
  }
  return (
    <>
      <div className="bg-white w-full rounded-lg p-4 shadow-md text-center">
        <h2 className="title text-3xl mb-4">Filtragem</h2>
        <form>
          {/* Campo de pesquisa por ID (modo admin) */}
          <div className={`${admin ? "" : "hidden"} flex flex-wrap gap-4`}>
            <Input
              type="number"
              label="Pesquisa por ID"
              wid="full"
              placeholder="Ex: 7344"
              value={filter.ind}
              setValue={(newValue) => setFilter({ ...filter, ind: newValue })}
            />
          </div>
          <hr className={`${admin ? "" : "hidden"} my-2 text-gray-300`} />

          {/* Tipo de operação e imóvel */}
          <div className={`${admin ? "hidden" : ""} flex flex-wrap gap-4`}>
            <Input
              type="text"
              label="Tipo de Imóvel"
              wid="150"
              select="true"
              selectOptions={["Qualquer","Casa", "Apartamento", "Terreno"]}
              value={filter.tipo}
              setValue={(newValue) => setFilter({ ...filter, tipo: newValue })}
            />
          </div>
          <hr className={`${admin ? "hidden" : ""} my-2 text-gray-300`} />

          {/* Localização - agora com País */}
          <h3 className="text-2xl font-semibold text-left mb-2 mt-2">
            Localização
          </h3>
          <div className="flex flex-wrap gap-4">
            <Input
              type="text"
              label="País"
              wid="full md:150"
              select="true"
              selectOptions={["Qualquer","Brasil", "Estados Unidos", "Portugal"]}
              value={filter.pais}
              setValue={(newValue) => setFilter({ ...filter, pais: newValue })}
            />
            <Input
              type="text"
              label="Estado"
              wid="full md:150"
              select="true"
              selectOptions={["Qualquer","SP", "RJ", "MG","PR"]}
              value={filter.estado}
              setValue={(newValue) => setFilter({ ...filter, estado: newValue })}
            />
            <Input
              type="text"
              label="Cidade"
              wid="full md:150"
              select="true"
              selectOptions={["Qualquer","São Paulo", "Rio de Janeiro", "Belo Horizonte","Curitiba"]}
              value={filter.cidade}
              setValue={(newValue) => setFilter({ ...filter, cidade: newValue })}
            />
            <Input
              type="text"
              label="Bairro"
              wid="170"
              value={filter.bairro}
              setValue={(newValue) => setFilter({ ...filter, bairro: newValue })}
            />
          </div>

          <hr className="my-2 text-gray-300" />

          {/* Preço */}
          <h3 className="text-2xl font-semibold text-left mb-2 mt-2">Preço</h3>
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

          {/* Cômodo */}
          <h3
            className={`text-2xl font-semibold text-left mb-2 mt-2 ${
              admin ? "hidden" : ""
            }`}
          >
            Cômodo
          </h3>
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
              setValue={(newValue) => setFilter({ ...filter, banheiros: newValue })}
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
    </>
  );
}

export default FilterCard;
