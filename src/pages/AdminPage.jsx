import Header from "../components/Header";
import { FaPlus } from "react-icons/fa";
import FilterCard from "../components/FilterCard";
import CardProperty from "../components/CardProperty";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

JSON.stringify();

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
          await createImovel(newImovel);
          window.location.reload();
        }
        const normalized = data.map((p) => ({
          ...p,
          ind: Number(p.ind),
        }));
        setProperties(normalized);
        console.log(normalized);
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

    const propertyToSend = {
      id: propertyId,
      rua: String(selectedProperty.rua),
      bairro: String(selectedProperty.bairro),
      cidade: String(selectedProperty.cidade),
      estado: String(selectedProperty.estado),
      pais: String(selectedProperty.pais),
      area: sanitizeNumber(selectedProperty.area),
      quartos: sanitizeNumber(selectedProperty.quartos),
      banheiros: sanitizeNumber(selectedProperty.banheiros),
      vagas: sanitizeNumber(selectedProperty.vagas),
      valor: sanitizeNumber(selectedProperty.valor),
      numero: sanitizeNumber(selectedProperty.numero),
      cep: String(selectedProperty.cep).replace(/[^\d]/g, ""),
      tipo: selectedProperty.tipo || "Casa",
      descricao: String(selectedProperty.descricao),
      imagens: selectedProperty.imagens || [],
    };

    try {
      const handleEdit = async () => {
        await updateImovel(propertyToSend);
        setProperties((prev) =>
          prev.map((p) => (p.ind === propertyId ? propertyToSend : p))
        );
        alert(`Imóvel de id ${propertyId} foi editado.`);
        closeModal();
      };
      handleEdit();
    } catch (err) {
      console.error("Erro ao editar imóvel:", err);
    }
  };

  const addPropertyFunction = (property) => {
    const propertyToSend = {
      id: propertyId,
      rua: String(selectedProperty.rua),
      bairro: String(selectedProperty.bairro),
      cidade: String(selectedProperty.cidade),
      estado: String(selectedProperty.estado),
      pais: String(selectedProperty.pais),
      area: sanitizeNumber(selectedProperty.area),
      quartos: sanitizeNumber(selectedProperty.quartos),
      banheiros: sanitizeNumber(selectedProperty.banheiros),
      vagas: sanitizeNumber(selectedProperty.vagas),
      valor: sanitizeNumber(selectedProperty.valor),
      numero: sanitizeNumber(selectedProperty.numero),
      cep: String(selectedProperty.cep).replace(/[^\d]/g, ""),
      tipo: selectedProperty.tipo || "Casa",
      descricao: String(selectedProperty.descricao),
      imagens: selectedProperty.imagens || [],
    };
    if (!propertyToSend.tipo) propertyToSend.tipo = "Casa";

    try {
      const handleCreate = async () => {
        await createImovel(propertyToSend);
        console.log(propertyToSend);
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
      const numericId = Number(id);
      const selectProperty = properties.find(
        (property) => Number(property.ind) === numericId
      );
      setSelectedProperty(selectProperty);
      setModalType(type);
      setPropertyId(numericId);
      console.log(selectedProperty);
    },
    [properties]
  );

  const closeModal = useCallback(() => {
    setModalType(null);
    setPropertyId(null);
    setSelectedProperty(null);
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

      <div className="bg-[#F3F3F3] grid grid-cols-[400px_2fr] max-[710px]:grid-cols-1 p-4 pb-28 overflow-y-auto">
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

// ✅ EditProperty agora com rolagem e todos os campos
function EditProperty({ functions, property }) {
  if (!property) return <p>Carregando dados do imóvel...</p>;

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      {/* Localização */}
      <div className="flex flex-wrap gap-4">
        <Input
          type="text"
          label="País"
          select={true}
          selectOptions={["Brasil", "Estados Unidos", "Portugal"]}
          value={property.pais}
          setValue={(v) => functions.change({ ...property, pais: String(v) })}
        />
        <Input
          type="text"
          label="Estado"
          value={property.estado}
          setValue={(v) => functions.change({ ...property, estado: String(v) })}
        />
        <Input
          type="text"
          label="Cidade"
          value={property.cidade}
          setValue={(v) => functions.change({ ...property, cidade: String(v) })}
        />
        <Input
          type="text"
          label="Bairro"
          value={property.bairro}
          setValue={(v) => functions.change({ ...property, bairro: String(v) })}
        />
      </div>

      {/* Endereço */}
      <div className="flex flex-wrap gap-4 mt-2">
        <Input
          type="text"
          label="Rua"
          value={property.rua}
          setValue={(v) => functions.change({ ...property, rua: String(v) })}
        />
        <Input
          type="number"
          label="Número"
          value={property.numero}
          setValue={(v) => functions.change({ ...property, numero: String(v) })}
        />
        <Input
          type="text"
          label="CEP"
          value={property.cep}
          setValue={(v) => functions.change({ ...property, cep: String(v) })}
        />
      </div>

      {/* Dados gerais */}
      <div className="flex flex-wrap gap-4 mt-2">
        <Input
          type="text"
          label="Situação"
          select={true}
          selectOptions={["Venda", "Aluguel"]}
          value={property.situacao}
          setValue={(v) =>
            functions.change({ ...property, situacao: String(v) })
          }
        />
        <Input
          type="text"
          label="Tipo de Imóvel"
          select={true}
          selectOptions={["Casa", "Apartamento", "Terreno"]}
          value={property.tipo}
          setValue={(v) => functions.change({ ...property, tipo: String(v) })}
        />
        <Input
          type="number"
          label="Valor"
          value={property.valor}
          setValue={(v) => functions.change({ ...property, valor: Number(v) })}
        />
      </div>

      {/* Estrutura */}
      <div className="flex flex-wrap gap-4 mt-2">
        <Input
          type="number"
          label="Quartos"
          value={property.quartos}
          setValue={(v) =>
            functions.change({ ...property, quartos: Number(v) })
          }
        />
        <Input
          type="number"
          label="Banheiros"
          value={property.banheiros}
          setValue={(v) =>
            functions.change({ ...property, banheiros: Number(v) })
          }
        />
        <Input
          type="number"
          label="Vagas"
          value={property.vagas}
          setValue={(v) => functions.change({ ...property, vagas: Number(v) })}
        />
        <Input
          type="number"
          label="Área (m²)"
          value={property.area}
          setValue={(v) => functions.change({ ...property, area: Number(v) })}
        />
      </div>

      {/* Descrição e imagens */}
      {/* Descrição */}
      <Input
        type="text"
        label="Descrição"
        setValue={(v) =>
          functions.change({ ...property, descricao: String(v) })
        }
      />

      {/* Imagens */}
      <Input
        type="file"
        label="Imagens"
        wid="full"
        multiple
        className="file:bg-[#0f3e58] file:text-white file:p-1 file:rounded-md file:hover:bg-[#0d3246] cursor-pointer"
        setValue={(e) =>
          functions.change({
            ...property,
            imagens: Array.from(e.target.files),
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
        Esta ação é irreversível. Ao confirmar, todos os dados do imóvel de id{" "}
        {propertyId} serão perdidos.
      </p>
      <div className="flex items-center justify-center mt-4 gap-4">
        <Button
          label="Cancelar"
          onClick={functions.close}
          wid="1/2"
          className="bg-gray-500 hover:bg-gray-600"
        />
        <Button
          label="Deletar"
          onClick={functions.delete}
          wid="1/2"
          className="bg-red-600 hover:bg-red-700"
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
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      {/* Usa os mesmos campos do EditProperty */}
      <EditProperty
        functions={{ edit: () => functions.add(property), change: setProperty }}
        property={property}
      />
    </div>
  );
}

export default AdminPage;
