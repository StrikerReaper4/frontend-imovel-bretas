import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

import Header from "../components/Header";
import FilterCard from "../components/FilterCard";
import CardProperty from "../components/CardProperty";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Button from "../components/Button";
import Loading from "../components/Loading";

import {
  getImoveis,
  deleteImovel,
  createImovel,
  updateImovel,
} from "../services/imovelService";

function AdminPage() {
  const navigate = useNavigate();
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
    try {
      const token = localStorage.getItem("token");
      const expiry = localStorage.getItem("token_expiry");

      if (!token || Date.now() > expiry) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiry");
        navigate("/admin");
      }
    } catch (error) {
      console.log(error);
      navigate("/admin");
    }

    const fetchProperties = async () => {
      try {
        const data = await getImoveis();
        if (data.length === 0) {
          const newImovel = {
            ind: 0,
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
            descricao: "Descrição dos Imóveis",
            img: "/placeholder_house.jpg",
          };
          const response = await createImovel(newImovel);
          console.log("resposta", response);
          window.location.reload();
        }
        const normalized = data.map((p) => ({
          ...p,
          ind: Number(p.ind),
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
            properties.find((property) => property.ind === propertyId)
          ),
          1
        );
        setProperties([...properties]);
        setSelectedProperty(null);
        alert(`Imóvel de ind ${propertyId} foi deletado.`);
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

    const propertyId = selectedProperty.ind;
    console.log("Editando imóvel de ind:", propertyId, selectedProperty);

    // Criando cópia limpa para manipulação
    const { img, descricao, ind, ...temporaryProperty } = selectedProperty;

    temporaryProperty.area = sanitizeNumber(temporaryProperty.area);
    temporaryProperty.quartos = sanitizeNumber(temporaryProperty.quartos);
    temporaryProperty.banheiros = sanitizeNumber(temporaryProperty.banheiros);
    temporaryProperty.vagas = sanitizeNumber(temporaryProperty.vagas);
    temporaryProperty.valor = sanitizeNumber(temporaryProperty.valor);
    temporaryProperty.numero = sanitizeNumber(temporaryProperty.numero);
    temporaryProperty.cep = String(temporaryProperty.cep).replace(/[^\d]/g, ""); // remove hífens e letras

    const propertyToSend = {
      ...temporaryProperty,
      descricao: descricao, // Mantém a descrição original para edição
      img: img, // Mantém a imagem original
      id: propertyId, // Envia o ID
    };
    console.log("Dados enviados para edição:", propertyToSend);

    try {
      const handleEdit = async () => {
        const response = await updateImovel(propertyToSend);
        console.log("resposta", response);
        setProperties((prev) =>
          prev.map((p) => (p.ind === propertyId ? propertyToSend : p))
        );

        setSelectedProperty(null);
        alert(`Imóvel de ind ${propertyId} foi editado.`);
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

    if (!temporaryProperty.tipo) {
      temporaryProperty.tipo = "Casa";
    }
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
    (type, id = null) => {
      console.log("Modal aberto:", type, "ind:", id);
      console.log("Lista de propriedades:", properties);

      if (!id && type !== "add") {
        console.error("ID inválido recebido:", id);
        return;
      }

      const numericId = Number(id);
      const selectProperty = properties.find(
        (property) => Number(property.ind) === numericId
      );

      if (!selectProperty) {
        console.error("Nenhum imóvel encontrado com ind:", numericId);
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

// Edit Property Modal
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
        {/* Restante do código do EditProperty */}
        <Input
          type="text"
          label="Descrição"
          wid="full"
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
      </div>

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
        Esta ação é irreversível. Ao confirmar, todos os dados do imóvel de ind{" "}
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
      {/* Campos do AddProperty */}
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
      {/* Continuação do formulário */}
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
