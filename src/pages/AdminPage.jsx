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
    const clean = String(value).replace(/[^\d]/g, "");
    return clean === "" ? 0 : Number(clean);
  }

  const recieveFilterProperties = (items) => {
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
            tipo: "Casa",
            rua: "Rua Exemplo",
            numero: "123",
            bairro: "Centro",
            cidade: "Cidade",
            estado: "Estado",
            cep: "00000-000",
            pais: "Brasil",
            area: 100,
            quartos: 2,
            banheiros: 1,
            suites: 0,
            vagas: 1,
            valor: 100000,
            id_pessoa: 1,
            descricao: "Imóvel de exemplo",
            img: "/placeholder_house.jpg",
          };
          await createImovel(newImovel);
          window.location.reload();
        }
        const normalized = data.map((p) => ({
          ...p,
          ind: Number(p.ind),
        }));
        setProperties(normalized);
      } catch (err) {
        console.error("Erro ao pegar imóveis:", err);
      }
    };
    fetchProperties();
  }, []);

  const deletePropertyFunction = () => {
    try {
      const handleDelete = async () => {
        await deleteImovel(propertyId);
        setProperties((prev) =>
          prev.filter((property) => property.ind !== propertyId)
        );
        setSelectedProperty(null);
        alert(`Imóvel ${propertyId} deletado.`);
        closeModal();
      };
      handleDelete();
    } catch (err) {
      console.error(err);
    }
  };

  const editPropertyFunction = () => {
    if (!selectedProperty) return;

    const id = selectedProperty.ind;

    const propertyToSend = {
      ...selectedProperty,
      numero: sanitizeNumber(selectedProperty.numero),
      cep: String(selectedProperty.cep).replace(/[^\d]/g, ""),
      area: sanitizeNumber(selectedProperty.area),
      quartos: sanitizeNumber(selectedProperty.quartos),
      banheiros: sanitizeNumber(selectedProperty.banheiros),
      suites: sanitizeNumber(selectedProperty.suites),
      vagas: sanitizeNumber(selectedProperty.vagas),
      valor: sanitizeNumber(selectedProperty.valor),
      id,
    };

    const handleEdit = async () => {
      await updateImovel(propertyToSend);
      setProperties((prev) =>
        prev.map((p) => (p.ind === id ? propertyToSend : p))
      );
      alert(`Imóvel ${id} atualizado com sucesso!`);
      closeModal();
    };
    handleEdit();
  };

  const addPropertyFunction = (property) => {
    const propertyToSend = {
      ...property,
      numero: sanitizeNumber(property.numero),
      cep: String(property.cep).replace(/[^\d]/g, ""),
      area: sanitizeNumber(property.area),
      quartos: sanitizeNumber(property.quartos),
      banheiros: sanitizeNumber(property.banheiros),
      suites: sanitizeNumber(property.suites),
      vagas: sanitizeNumber(property.vagas),
      valor: sanitizeNumber(property.valor),
      id_pessoa: 1,
    };

    const handleCreate = async () => {
      await createImovel(propertyToSend);
      alert("Novo imóvel adicionado!");
      closeModal();
      window.location.reload();
    };
    handleCreate();
  };

  const openModal = useCallback(
    (type, id = null) => {
      if (!id && type !== "add") return;
      const selected = properties.find((p) => Number(p.ind) === Number(id));
      setSelectedProperty(selected);
      setModalType(type);
      setPropertyId(id);
    },
    [properties]
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setPropertyId(null);
  }, []);

  if (properties.length === 0) return <Loading />;

  return (
    <>
      <Header admin={true} />
      {modalType === "edit" && (
        <Modal
          propertyId={propertyId}
          title="Editar Imóvel"
          data={
            <EditProperty
              property={selectedProperty}
              functions={{
                edit: editPropertyFunction,
                change: setSelectedProperty,
              }}
            />
          }
          onClose={closeModal}
        />
      )}

      {modalType === "delete" && (
        <Modal
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

        <div className="space-y-1 text-center">
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
        onClick={() => openModal("add")}
      >
        <FaPlus size={40} className="text-white" />
      </div>
    </>
  );
}

// ✅ Componente Editar Imóvel — agora com TODOS os campos
function EditProperty({ functions, property }) {
  if (!property) return <p>Carregando imóvel...</p>;

  const handleChange = (field, value) =>
    functions.change({ ...property, [field]: value });

  return (
    <div className="space-y-4">
      <Input
        label="Tipo"
        value={property.tipo}
        setValue={(v) => handleChange("tipo", v)}
      />
      <Input
        label="Rua"
        value={property.rua}
        setValue={(v) => handleChange("rua", v)}
      />
      <Input
        label="Número"
        value={property.numero}
        setValue={(v) => handleChange("numero", v)}
      />
      <Input
        label="Bairro"
        value={property.bairro}
        setValue={(v) => handleChange("bairro", v)}
      />
      <Input
        label="Cidade"
        value={property.cidade}
        setValue={(v) => handleChange("cidade", v)}
      />
      <Input
        label="Estado"
        value={property.estado}
        setValue={(v) => handleChange("estado", v)}
      />
      <Input
        label="CEP"
        value={property.cep}
        setValue={(v) => handleChange("cep", v)}
      />
      <Input
        label="País"
        value={property.pais}
        setValue={(v) => handleChange("pais", v)}
      />
      <Input
        label="Área (m²)"
        value={property.area}
        setValue={(v) => handleChange("area", v)}
      />
      <Input
        label="Quartos"
        value={property.quartos}
        setValue={(v) => handleChange("quartos", v)}
      />
      <Input
        label="Banheiros"
        value={property.banheiros}
        setValue={(v) => handleChange("banheiros", v)}
      />
      <Input
        label="Suítes"
        value={property.suites}
        setValue={(v) => handleChange("suites", v)}
      />
      <Input
        label="Vagas"
        value={property.vagas}
        setValue={(v) => handleChange("vagas", v)}
      />
      <Input
        label="Valor (R$)"
        value={property.valor}
        setValue={(v) => handleChange("valor", v)}
      />
      <Input
        label="Descrição"
        textarea
        rows={3}
        value={property.descricao}
        setValue={(v) => handleChange("descricao", v)}
      />
      <Input
        type="file"
        label="Imagem"
        wid="full"
        className="file:bg-[#0f3e58] file:text-white file:p-1 file:rounded-md"
        setValue={(e) =>
          handleChange("img", URL.createObjectURL(e.target.files[0]))
        }
      />
      <div className="flex justify-center mt-4">
        <Button label="Salvar Alterações" wid="full" onClick={functions.edit} />
      </div>
    </div>
  );
}

// Modal de Deletar
function DeleteProperty({ functions, propertyId }) {
  return (
    <div>
      <p className="text-left text-[#0f3e58] text-md mt-2">
        Deseja realmente excluir o imóvel ID {propertyId}? Esta ação é
        irreversível.
      </p>
      <div className="flex gap-4 mt-4 justify-center">
        <Button
          label="Cancelar"
          onClick={functions.close}
          className="bg-gray-500 hover:bg-gray-600"
        />
        <Button
          label="Deletar"
          onClick={functions.delete}
          className="bg-red-600 hover:bg-red-700"
        />
      </div>
    </div>
  );
}

// Modal de Adicionar
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
    area: "",
    quartos: "",
    banheiros: "",
    suites: "",
    vagas: "",
    valor: "",
    descricao: "",
    img: "",
  });

  return (
    <div className="space-y-4">
      {Object.keys(property).map((key) =>
        key === "descricao" ? (
          <Input
            key={key}
            label="Descrição"
            textarea
            rows={3}
            value={property[key]}
            setValue={(v) => setProperty({ ...property, [key]: v })}
          />
        ) : key === "img" ? (
          <Input
            key={key}
            type="file"
            label="Imagem"
            wid="full"
            setValue={(e) =>
              setProperty({
                ...property,
                img: URL.createObjectURL(e.target.files[0]),
              })
            }
          />
        ) : (
          <Input
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={property[key]}
            setValue={(v) => setProperty({ ...property, [key]: v })}
          />
        )
      )}
      <div className="flex justify-center mt-4">
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
