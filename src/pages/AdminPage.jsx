import Header from "../components/Header";
import { FaPlus } from "react-icons/fa";
import FilterCard from "../components/FilterCard";
import CardProperty from "../components/CardProperty";
import { useState, useCallback, useEffect } from "react";
import {
  getImoveis,
  deleteImovel,
  createImovel,
  updateImovel,
} from "../services/imovelService";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Button from "../components/Button";
import Loading from "../components/Loading";

function AdminPage() {
  const [properties, setProperties] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  function sanitizeNumber(value) {
    const clean = String(value).replace(/[^\d]/g, ""); // remove tudo que não for número
    return clean === "" ? 0 : Number(clean);
  }

  const recieveFilterProperties = (items) => {
    console.log("Recebendo filtro", items);
    setProperties(items);
  };
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getImoveis();
        if (data.length === 0) {
          //criar imovel placeholder
          const newImovel = {
            id: 0,
            tipo: "Casa",
            rua: "Rua dos Imóveis",
            numero: "123",
            bairro: "Bairro dos Imóveis",
            cidade: "Cidade dos Imóveis",
            estado: "Estado dos Imóveis",
            cep: "00000-000",
            pais: "Brasil",
            area: 100,
            quartos: 2,
            banheiros: 2,
            suites: 1,
            vagas: 2,
            valor: 100000,
            id_pessoa: 1,
            descricao: "Descricão dos Imóveis",
            img: "/placeholder_house.jpg",
          };
          const response = await createImovel(newImovel);
          console.log("resposta", response);
          window.location.reload();
        }
        const normalized = data.map((p) => ({
          ...p,
          id: Number(p.id),
        }));
        console.log("Propriedades normalizadas:", normalized);
        setProperties(normalized);
      } catch (err) {
        console.error("Erro ao pegar imóveis:", err);
      }
    };
    fetchProperties();
  }, []);
  const deletePropertyFunction = () => {
    console.log(propertyId);
    try {
      const handleDelete = async () => {
        const response = await deleteImovel(propertyId);
        console.log("resposta", response);
        properties.splice(
          properties.indexOf(
            properties.find((property) => property.id === propertyId)
          ),
          1
        );
        setProperties([...properties]);
        setSelectedProperty(null);
        alert(`Imóvel de ID ${propertyId} foi deletado.`);
        closeModal();
        window.location.reload();
      };
      handleDelete();
    } catch (err) {
      console.error(err);
    }
  };
  const editPropertyFunction = () => {
    if (!selectedProperty) {
      console.error("Nenhum imóvel selecionado para edição.");
      return;
    }

    const propertyId = selectedProperty.id;
    console.log("Editando imóvel de ID:", propertyId, selectedProperty);

    const { img, descricao, id, ...temporaryProperty } = selectedProperty;
    temporaryProperty.area = sanitizeNumber(temporaryProperty.area);
    temporaryProperty.quartos = sanitizeNumber(temporaryProperty.quartos);
    temporaryProperty.banheiros = sanitizeNumber(temporaryProperty.banheiros);
    temporaryProperty.vagas = sanitizeNumber(temporaryProperty.vagas);
    temporaryProperty.valor = sanitizeNumber(temporaryProperty.valor);

    const propertyToSend = { ...temporaryProperty, id: propertyId };

    try {
      const handleEdit = async () => {
        const response = await updateImovel(propertyToSend);
        console.log("resposta", response);
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? propertyToSend : p))
        );

        setSelectedProperty(null);
        alert(`Imóvel de ID ${propertyId} foi editado.`);
        closeModal();
      };
      handleEdit();
    } catch (err) {
      console.error("Erro ao editar imóvel:", err);
    }
  };

  const addPropertyFunction = (property) => {
    console.log(property);
    const { img, descricao, ...temporaryProperty } = property;
    temporaryProperty.area = Number(temporaryProperty.area);
    temporaryProperty.quartos = Number(temporaryProperty.quartos);
    temporaryProperty.banheiros = Number(temporaryProperty.banheiros);
    temporaryProperty.vagas = Number(temporaryProperty.vagas);
    temporaryProperty.valor = Number(temporaryProperty.valor);
    console.log(temporaryProperty);
    try {
      const handleCreate = async () => {
        const newImovel = await createImovel(temporaryProperty);
        console.log(newImovel);
        setProperties([...properties, newImovel]);
        setSelectedProperty(null);
        alert("Novo imóvel adicionado.");
        closeModal();
        window.location.reload();
      };
      handleCreate();
    } catch (err) {
      console.log(err);
    }
  };

  const openModal = useCallback(
    (type, id) => {
      console.log("Modal aberto:", type, "ID:", id);
      console.log("Lista de propriedades:", properties);

      const numericId = Number(id);
      const selectProperty = properties.find(
        (property) => Number(property.id) === Number(numericId)
      );

      console.log("Buscando propriedade com ID:", numericId);
      console.log(
        "Propriedades disponíveis:",
        properties.map((p) => p.id)
      );

      if (!selectProperty) {
        console.error("Nenhum imóvel encontrado com ID:", numericId);
      } else {
        console.log("Propriedade encontrada:", selectProperty);
      }

      setSelectedProperty(selectProperty);
      setModalType(type);
      setPropertyId(numericId);
    },
    [properties]
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setPropertyId(null);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (properties.length === 0) {
    return <Loading />;
  }
  return (
    <>
      <Header admin={true} />
      {modalType === "edit" && (
        <Modal
          propertyId={propertyId}
          title="Editar Imóvel"
          data={
            <EditProperty
              functions={{
                edit: editPropertyFunction,
                change: setSelectedProperty,
              }}
              property={selectedProperty}
            />
          }
          onClose={closeModal}
        />
      )}
      {modalType === "delete" && (
        <Modal
          propertyId={propertyId}
          title="Tem certeza em deletar o imóvel?"
          data={
            <DeleteProperty
              functions={{ close: closeModal, delete: deletePropertyFunction }}
              propertyId={propertyId}
            />
          }
          onClose={closeModal}
        />
      )}
      {modalType === "add" && (
        <Modal
          title="Adicionar Imóvel"
          data={<AddProperty functions={{ add: addPropertyFunction }} />}
          onClose={closeModal}
        />
      )}
      <div className="bg-[#F3F3F3] grid grid-cols-[400px_2fr] max-[710px]:grid-cols-1 p-4 pb-28">
        <div className="sticky top-4 self-start max-[710px]:static max-[710px]:mb-8">
          <FilterCard admin={true} onFilter={recieveFilterProperties} />
        </div>

        <div className="space-y-1 items-center justify-center text-center">
          <h2 className="text-3xl mb-4 title">Destaques</h2>
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {properties.map((property, index) => (
              <CardProperty
                key={index}
                property={property}
                admin={true}
                handleOpen={openModal}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="fixed bottom-3 right-3 cursor-pointer bg-[#0f3e58] rounded-full w-16 h-16 flex items-center justify-center hover:bg-[#14506e] transition"
        onClick={() => openModal("add", null)}
      >
        <FaPlus size={40} className="text-white" />
      </div>
    </>
  );
}

function EditProperty({ functions, property }) {
  if (!property) {
    console.warn("EditProperty renderizado sem propriedade.");
    return <p>Carregando dados do imóvel...</p>;
  }
  return (
    <div>
      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1">
        <Input
          type="text"
          label="País"
          wid="150"
          select={true}
          selectOptions={["Brasil", "Estados Unidos", "Portugal"]}
          value={property.pais}
          setValue={(newValue) =>
            functions.change({ ...property, pais: newValue })
          }
        />
        <Input
          type="text"
          label="Estado"
          wid="150"
          select={true}
          selectOptions={["SP", "RJ", "MG"]}
          value={property.estado}
          setValue={(newValue) =>
            functions.change({ ...property, estado: newValue })
          }
        />
        <Input
          type="text"
          label="Cidade"
          wid="150"
          select={true}
          selectOptions={["São Paulo", "Rio de Janeiro", "Belo Horizonte"]}
          value={property.cidade}
          setValue={(newValue) =>
            functions.change({ ...property, cidade: newValue })
          }
        />
        <Input
          type="text"
          label="Bairro"
          wid="150"
          placeholder="Ex: Centro"
          value={property.bairro}
          setValue={(newValue) =>
            functions.change({ ...property, bairro: newValue })
          }
        />
      </div>

      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1 mt-2">
        <Input
          type="text"
          label="Rua"
          wid="240"
          value={property.rua}
          setValue={(newValue) =>
            functions.change({ ...property, rua: newValue })
          }
        />
        <Input
          type="text"
          label="Número"
          wid="50"
          value={property.numero}
          setValue={(newValue) =>
            functions.change({ ...property, numero: newValue })
          }
        />
        <Input
          type="text"
          label="CEP"
          wid="150"
          value={property.cep}
          setValue={(newValue) =>
            functions.change({ ...property, cep: newValue })
          }
        />
      </div>

      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1 mt-2">
        <Input
          type="text"
          label="Situação"
          wid="150"
          select={true}
          selectOptions={["Venda", "Aluguel"]}
          value={property.situacao}
          setValue={(newValue) =>
            functions.change({ ...property, situacao: newValue })
          }
        />
        <Input
          type="text"
          label="Tipo de Imóvel"
          wid="150"
          select={true}
          selectOptions={["Casa", "Apartamento", "Terreno"]}
          value={property.tipo}
          setValue={(newValue) =>
            functions.change({ ...property, tipo: newValue })
          }
        />
        <Input
          type="number"
          label="Valor"
          wid="150"
          value={property.valor}
          setValue={(newValue) =>
            functions.change({ ...property, valor: newValue })
          }
        />
      </div>

      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1 mt-2">
        <Input
          type="number"
          label="Quartos"
          wid="150"
          value={property.quartos}
          setValue={(newValue) =>
            functions.change({ ...property, quartos: newValue })
          }
        />
        <Input
          type="number"
          label="Banheiros"
          wid="150"
          value={property.banheiros}
          setValue={(newValue) =>
            functions.change({ ...property, banheiros: newValue })
          }
        />
        <Input
          type="number"
          label="Vagas"
          wid="150"
          value={property.vagas}
          setValue={(newValue) =>
            functions.change({ ...property, vagas: newValue })
          }
        />
        <Input
          type="number"
          label="Área (m²)"
          wid="150"
          value={property.area}
          setValue={(newValue) =>
            functions.change({ ...property, area: newValue })
          }
        />
      </div>

      <Input
        type="text"
        label="Descrição"
        wid="full"
        placeholder="Ex: Uma casa espaçosa e confortável, ideal para famílias grandes."
        textarea={true}
        rows={3}
        value={property.descricao}
        setValue={(newValue) =>
          functions.change({ ...property, descricao: newValue })
        }
      />

      <Input
        type="file"
        label="Imagens"
        wid="full"
        multiple
        className="file:bg-[#0f3e58] file:text-white file:p-1 file:rounded-md file:hover:bg-[#0d3246] cursor-pointer"
        setValue={(files) =>
          functions.change({
            ...property,
            imagens: Array.from(files.target.files),
          })
        }
      />

      <div className="flex items-center justify-center mt-4">
        <Button label="Salvar" wid="full" onClick={() => functions.edit()} />
      </div>
    </div>
  );
}

function DeleteProperty({ functions, propertyId }) {
  return (
    <div>
      <p className="text-left antialiased text-[#0f3e58] text-md mt-2">
        Esta ação é irreversível. Ao confirmar, todos os dados do imóvel de ID{" "}
        {propertyId} serão perdidos.
      </p>
      <div className="flex items-center justify-center mt-4 gap-4">
        <Button
          label="Cancelar"
          onClick={functions.close}
          wid="1/2"
          className={"bg-gray-500 hover:bg-gray-600"}
        />
        <Button
          label="Deletar"
          onClick={functions.delete}
          wid="1/2"
          className={"bg-red-600 hover:bg-red-700"}
        />
      </div>
    </div>
  );
}

function AddProperty({ functions }) {
  const [property, setProperty] = useState({
    tipo: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    pais: "",
    area: 0,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    valor: 0,
    id_pessoa: 1,
    descricao: "",
    imagens: [],
  });

  return (
    <div>
      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1">
        <Input
          type="text"
          label="Estado"
          wid="150"
          select={true}
          selectOptions={[
            "AC",
            "AL",
            "AP",
            "AM",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MT",
            "MS",
            "MG",
            "PA",
            "PB",
            "PR",
            "PE",
            "PI",
            "RJ",
            "RN",
            "RS",
            "RO",
            "RR",
            "SC",
            "SP",
            "SE",
            "TO",
          ]}
          value={property.estado}
          setValue={(newValue) =>
            setProperty({ ...property, estado: newValue })
          }
        />
        <Input
          type="text"
          label="Cidade"
          wid="150"
          select="true"
          selectOptions={[
            "Belo Horizonte",
            "São Paulo",
            "Rio de Janeiro",
            "Campo Grande",
            "Salvador",
          ]}
          value={property.cidade}
          setValue={(newValue) =>
            setProperty({ ...property, cidade: newValue })
          }
        />
        <Input
          type="text"
          label="Bairro"
          wid="150"
          value={property.bairro}
          setValue={(newValue) =>
            setProperty({ ...property, bairro: newValue })
          }
        />
      </div>
      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1">
        <Input
          type="text"
          label="Rua"
          wid="240"
          value={property.rua}
          setValue={(newValue) => setProperty({ ...property, rua: newValue })}
        />

        <Input
          type="text"
          label="Número"
          wid="50"
          value={property.numero}
          setValue={(newValue) =>
            setProperty({ ...property, numero: newValue })
          }
        />

        <Input
          type="text"
          label="CEP"
          wid="150"
          value={property.cep}
          setValue={(newValue) => setProperty({ ...property, cep: newValue })}
        />

        <Input
          type="text"
          label="País"
          wid="150"
          select={true}
          selectOptions={[
            "Brasil",
            "Portugal",
            "Estados Unidos",
            "Argentina",
            "Uruguai",
            "Bolivia",
            "Chile",
            "Colombia",
            "Equador",
            "Guiana",
            "Paraguay",
            "Peru",
            "Suriname",
            "Uruguay",
            "Venezuela",
          ]}
          value={property.pais}
          setValue={(newValue) => setProperty({ ...property, pais: newValue })}
        />
      </div>
      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1 mt-2">
        <Input
          type="text"
          label="Situação"
          wid="150"
          select="true"
          selectOptions={["Venda", "Aluguel"]}
          value={property.situacao}
          setValue={(newValue) =>
            setProperty({ ...property, situacao: newValue })
          }
        />
        <Input
          type="text"
          label="Tipo de Imóvel"
          wid="150"
          select="true"
          selectOptions={["Casa", "Apartamento", "Terreno"]}
          value={property.tipo}
          setValue={(newValue) => setProperty({ ...property, tipo: newValue })}
        />
        <Input
          type="number"
          label="Valor"
          wid="150"
          value={property.valor}
          setValue={(newValue) => setProperty({ ...property, valor: newValue })}
        />
      </div>

      <div className="flex items-left space-y-4 space-x-4 -mb-2 flex-cols-2 md:flex-cols-1 mt-2">
        <Input
          type="number"
          label="Quartos"
          wid="150"
          value={property.quartos}
          setValue={(newValue) =>
            setProperty({ ...property, quartos: newValue })
          }
        />
        <Input
          type="number"
          label="Banheiros"
          wid="150"
          value={property.banheiros}
          setValue={(newValue) =>
            setProperty({ ...property, banheiros: newValue })
          }
        />
        <Input
          type="number"
          label="Vagas"
          wid="150"
          value={property.vagas}
          setValue={(newValue) => setProperty({ ...property, vagas: newValue })}
        />
        <Input
          type="number"
          label="Área (m²)"
          wid="150"
          value={property.area}
          setValue={(newValue) => setProperty({ ...property, area: newValue })}
        />
      </div>

      <Input
        type="text"
        label="Descrição"
        wid="full"
        textarea="true"
        rows={3}
        value={property.descricao}
        setValue={(newValue) =>
          setProperty({ ...property, descricao: newValue })
        }
      />

      <Input
        type="file"
        label="Imagens"
        wid="full"
        multiple
        className="file:bg-[#0f3e58] file:text-white file:p-1 file:rounded-md file:hover:bg-[#0d3246] cursor-pointer"
        setValue={(files) =>
          setProperty({ ...property, imagens: Array.from(files.target.files) })
        }
      />

      <div className="flex items-center justify-center mt-4">
        <Button
          label="Salvar"
          wid="full"
          onClick={() => functions.add(property)}
        />
      </div>
    </div>
  );
}

export default AdminPage;
