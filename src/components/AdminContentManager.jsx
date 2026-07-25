import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Building2,
  LoaderCircle,
  MapPinned,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import API from "../api";
import "./AdminContentManager.css";

const emptyNotice = {
  title: "",
  message: "",
  type: "general",
  active: true,
  order: 0,
};

const emptySector = {
  name: "",
  slug: "",
  icon: "🔧",
  description: "",
  active: true,
  order: 0,
};

const emptyPlace = {
  name: "",
  category: "Tourist Place",
  shortDescription: "",
  description: "",
  image: "",
  address: "",
  mapUrl: "",
  active: true,
  order: 0,
};

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    "Something went wrong"
  );
}

export default function AdminContentManager() {
  const [activeTab, setActiveTab] =
    useState("notices");

  const [notices, setNotices] =
    useState([]);

  const [sectors, setSectors] =
    useState([]);

  const [places, setPlaces] =
    useState([]);

  const [noticeForm, setNoticeForm] =
    useState(emptyNotice);

  const [sectorForm, setSectorForm] =
    useState(emptySector);

  const [placeForm, setPlaceForm] =
    useState(emptyPlace);

  const [editingId, setEditingId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [noticeResult, sectorResult, placeResult] =
        await Promise.all([
          API.get("/admin/content/notices"),
          API.get("/admin/content/sectors"),
          API.get("/admin/content/places"),
        ]);

      setNotices(
        Array.isArray(noticeResult.data)
          ? noticeResult.data
          : []
      );

      setSectors(
        Array.isArray(sectorResult.data)
          ? sectorResult.data
          : []
      );

      setPlaces(
        Array.isArray(placeResult.data)
          ? placeResult.data
          : []
      );
    } catch (loadError) {
      console.error(
        "Admin content load error:",
        loadError
      );

      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  function resetForms() {
    setNoticeForm(emptyNotice);
    setSectorForm(emptySector);
    setPlaceForm(emptyPlace);
    setEditingId("");
    setError("");
  }

  function changeTab(tab) {
    setActiveTab(tab);
    resetForms();
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function saveNotice(event) {
    event.preventDefault();

    if (!noticeForm.title.trim()) {
      setError("Notice title required hai.");
      return;
    }

    if (!noticeForm.message.trim()) {
      setError("Notice message required hai.");
      return;
    }

    await saveContent(
      "notices",
      noticeForm
    );
  }

  async function saveSector(event) {
    event.preventDefault();

    if (!sectorForm.name.trim()) {
      setError("Sector name required hai.");
      return;
    }

    const payload = {
      ...sectorForm,
      slug:
        sectorForm.slug.trim() ||
        generateSlug(sectorForm.name),
    };

    await saveContent(
      "sectors",
      payload
    );
  }

  async function savePlace(event) {
    event.preventDefault();

    if (!placeForm.name.trim()) {
      setError("Place name required hai.");
      return;
    }

    if (!placeForm.category.trim()) {
      setError("Place category required hai.");
      return;
    }

    await saveContent(
      "places",
      placeForm
    );
  }

  async function saveContent(type, payload) {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (editingId) {
        await API.put(
          `/admin/content/${type}/${editingId}`,
          payload
        );

        setMessage(
          "Content successfully update ho gaya."
        );
      } else {
        await API.post(
          `/admin/content/${type}`,
          payload
        );

        setMessage(
          "Content successfully add ho gaya."
        );
      }

      resetForms();
      await loadContent();
    } catch (saveError) {
  console.error(
    "Content save error:",
    saveError.response?.data || saveError
  );

  setError(
    saveError.response?.data?.message ||
    saveError.response?.data?.error ||
    "Content save nahi ho paya."
  );
}
  
  }

  async function deleteContent(type, id) {
    const confirmed = window.confirm(
      "Kya aap is item ko delete karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await API.delete(
        `/admin/content/${type}/${id}`
      );

      setMessage(
        "Content delete ho gaya."
      );

      if (editingId === id) {
        resetForms();
      }

      await loadContent();
    } catch (deleteError) {
      console.error(
        "Content delete error:",
        deleteError
      );

      setError(getErrorMessage(deleteError));
    }
  }

  function editNotice(item) {
    setActiveTab("notices");
    setEditingId(item._id);

    setNoticeForm({
      title: item.title || "",
      message: item.message || "",
      type: item.type || "general",
      active: item.active !== false,
      order: item.order || 0,
    });
  }

  function editSector(item) {
    setActiveTab("sectors");
    setEditingId(item._id);

    setSectorForm({
      name: item.name || "",
      slug: item.slug || "",
      icon: item.icon || "🔧",
      description: item.description || "",
      active: item.active !== false,
      order: item.order || 0,
    });
  }

  function editPlace(item) {
    setActiveTab("places");
    setEditingId(item._id);

    setPlaceForm({
      name: item.name || "",
      category:
        item.category || "Tourist Place",
      shortDescription:
        item.shortDescription || "",
      description: item.description || "",
      image: item.image || "",
      address: item.address || "",
      mapUrl: item.mapUrl || "",
      active: item.active !== false,
      order: item.order || 0,
    });
  }

  return (
    <div className="admin-content-manager">
      <div className="content-heading">
        <div>
          <span className="eyebrow">
            Website content
          </span>

          <h2>Content Management</h2>

          <p>
            Notices, service sectors aur city
            guide places manage karein.
          </p>
        </div>
      </div>

      {message && (
        <div className="info-message">
          {message}
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="content-tabs">
        <button
          type="button"
          className={
            activeTab === "notices"
              ? "active"
              : ""
          }
          onClick={() =>
            changeTab("notices")
          }
        >
          <Bell size={18} />
          Notices
        </button>

        <button
          type="button"
          className={
            activeTab === "sectors"
              ? "active"
              : ""
          }
          onClick={() =>
            changeTab("sectors")
          }
        >
          <Building2 size={18} />
          Sectors
        </button>

        <button
          type="button"
          className={
            activeTab === "places"
              ? "active"
              : ""
          }
          onClick={() =>
            changeTab("places")
          }
        >
          <MapPinned size={18} />
          City Guide
        </button>
      </div>

      {loading ? (
        <div className="content-loading">
          <LoaderCircle
            className="spin"
            size={22}
          />
          Content loading...
        </div>
      ) : (
        <>
          {activeTab === "notices" && (
            <div className="content-layout">
              <form
                className="content-form"
                onSubmit={saveNotice}
              >
                <FormHeading
                  editing={Boolean(editingId)}
                  title="Notice"
                  onCancel={resetForms}
                />

                <label>
                  Notice title
                  <input
                    value={noticeForm.title}
                    onChange={(event) =>
                      setNoticeForm({
                        ...noticeForm,
                        title: event.target.value,
                      })
                    }
                    placeholder="Important city update"
                  />
                </label>

                <label>
                  Notice message
                  <textarea
                    rows="4"
                    value={noticeForm.message}
                    onChange={(event) =>
                      setNoticeForm({
                        ...noticeForm,
                        message:
                          event.target.value,
                      })
                    }
                    placeholder="Notice ki complete information..."
                  />
                </label>

                <label>
                  Notice type
                  <select
                    value={noticeForm.type}
                    onChange={(event) =>
                      setNoticeForm({
                        ...noticeForm,
                        type: event.target.value,
                      })
                    }
                  >
                    <option value="general">
                      General
                    </option>

                    <option value="important">
                      Important
                    </option>

                    <option value="warning">
                      Warning
                    </option>

                    <option value="event">
                      Event
                    </option>
                  </select>
                </label>

                <CommonFields
                  form={noticeForm}
                  setForm={setNoticeForm}
                />

                <SaveButton
                  saving={saving}
                  editing={Boolean(editingId)}
                />
              </form>

              <ContentList
                items={notices}
                emptyText="No notices added."
                renderItem={(item) => (
                  <>
                    <div>
                      <small>
                        {item.type}
                      </small>
                      <h3>{item.title}</h3>
                      <p>{item.message}</p>
                    </div>

                    <ItemActions
                      item={item}
                      onEdit={editNotice}
                      onDelete={() =>
                        deleteContent(
                          "notices",
                          item._id
                        )
                      }
                    />
                  </>
                )}
              />
            </div>
          )}

          {activeTab === "sectors" && (
            <div className="content-layout">
              <form
                className="content-form"
                onSubmit={saveSector}
              >
                <FormHeading
                  editing={Boolean(editingId)}
                  title="Sector"
                  onCancel={resetForms}
                />

                <label>
                  Sector name
                  <input
                    value={sectorForm.name}
                    onChange={(event) => {
                      const name =
                        event.target.value;

                      setSectorForm({
                        ...sectorForm,
                        name,
                        slug: editingId
                          ? sectorForm.slug
                          : generateSlug(name),
                      });
                    }}
                    placeholder="Home Repair"
                  />
                </label>

                <label>
                  Slug
                  <input
                    value={sectorForm.slug}
                    onChange={(event) =>
                      setSectorForm({
                        ...sectorForm,
                        slug: generateSlug(
                          event.target.value
                        ),
                      })
                    }
                    placeholder="home-repair"
                  />
                </label>

                <label>
                  Icon
                  <input
                    value={sectorForm.icon}
                    onChange={(event) =>
                      setSectorForm({
                        ...sectorForm,
                        icon: event.target.value,
                      })
                    }
                    placeholder="🔧"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    rows="4"
                    value={
                      sectorForm.description
                    }
                    onChange={(event) =>
                      setSectorForm({
                        ...sectorForm,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Sector description..."
                  />
                </label>

                <CommonFields
                  form={sectorForm}
                  setForm={setSectorForm}
                />

                <SaveButton
                  saving={saving}
                  editing={Boolean(editingId)}
                />
              </form>

              <ContentList
                items={sectors}
                emptyText="No sectors added."
                renderItem={(item) => (
                  <>
                    <div>
                      <small>
                        {item.icon} {item.slug}
                      </small>
                      <h3>{item.name}</h3>
                      <p>
                        {item.description}
                      </p>
                    </div>

                    <ItemActions
                      item={item}
                      onEdit={editSector}
                      onDelete={() =>
                        deleteContent(
                          "sectors",
                          item._id
                        )
                      }
                    />
                  </>
                )}
              />
            </div>
          )}

          {activeTab === "places" && (
            <div className="content-layout">
              <form
                className="content-form"
                onSubmit={savePlace}
              >
                <FormHeading
                  editing={Boolean(editingId)}
                  title="City Place"
                  onCancel={resetForms}
                />

                <label>
                  Place name
                  <input
                    value={placeForm.name}
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Chittorgarh Fort"
                  />
                </label>

                <label>
                  Category
                  <select
                    value={
                      placeForm.category
                    }
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        category:
                          event.target.value,
                      })
                    }
                  >
                    <option value="Tourist Place">
                      Tourist Place
                    </option>
                    <option value="Hotel">
                      Hotel
                    </option>
                    <option value="Restaurant">
                      Restaurant
                    </option>
                    <option value="Hospital">
                      Hospital
                    </option>
                    <option value="Transport">
                      Transport
                    </option>
                    <option value="Shopping">
                      Shopping
                    </option>
                    <option value="Emergency">
                      Emergency
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>

                <label>
                  Short description
                  <textarea
                    rows="3"
                    value={
                      placeForm.shortDescription
                    }
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        shortDescription:
                          event.target.value,
                      })
                    }
                    placeholder="Card par dikhne wali short information..."
                  />
                </label>

                <label>
                  Full description
                  <textarea
                    rows="4"
                    value={
                      placeForm.description
                    }
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Place ki complete information..."
                  />
                </label>

                <label>
                  Image URL
                  <input
                    type="url"
                    value={placeForm.image}
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        image: event.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </label>

                {placeForm.image && (
                  <img
                    className="place-preview"
                    src={placeForm.image}
                    alt="Place preview"
                  />
                )}

                <label>
                  Address
                  <input
                    value={placeForm.address}
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        address:
                          event.target.value,
                      })
                    }
                    placeholder="Chittorgarh, Rajasthan"
                  />
                </label>

                <label>
                  Google Maps URL
                  <input
                    type="url"
                    value={placeForm.mapUrl}
                    onChange={(event) =>
                      setPlaceForm({
                        ...placeForm,
                        mapUrl:
                          event.target.value,
                      })
                    }
                    placeholder="https://maps.google.com/..."
                  />
                </label>

                <CommonFields
                  form={placeForm}
                  setForm={setPlaceForm}
                />

                <SaveButton
                  saving={saving}
                  editing={Boolean(editingId)}
                />
              </form>

              <ContentList
                items={places}
                emptyText="No city guide places added."
                renderItem={(item) => (
                  <>
                    {item.image && (
                      <img
                        className="content-list-image"
                        src={item.image}
                        alt={item.name}
                      />
                    )}

                    <div>
                      <small>
                        {item.category}
                      </small>
                      <h3>{item.name}</h3>
                      <p>
                        {item.shortDescription}
                      </p>
                    </div>

                    <ItemActions
                      item={item}
                      onEdit={editPlace}
                      onDelete={() =>
                        deleteContent(
                          "places",
                          item._id
                        )
                      }
                    />
                  </>
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FormHeading({
  editing,
  title,
  onCancel,
}) {
  return (
    <div className="content-form-heading">
      <h3>
        {editing ? "Update" : "Add"}{" "}
        {title}
      </h3>

      {editing && (
        <button
          type="button"
          className="icon-button"
          onClick={onCancel}
          title="Cancel editing"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

function CommonFields({
  form,
  setForm,
}) {
  return (
    <div className="common-fields">
      <label>
        Display order
        <input
          type="number"
          min="0"
          value={form.order}
          onChange={(event) =>
            setForm({
              ...form,
              order:
                Number(event.target.value) ||
                0,
            })
          }
        />
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) =>
            setForm({
              ...form,
              active:
                event.target.checked,
            })
          }
        />
        Active
      </label>
    </div>
  );
}

function SaveButton({
  saving,
  editing,
}) {
  return (
    <button
      type="submit"
      className="btn primary"
      disabled={saving}
    >
      {saving ? (
        <>
          <LoaderCircle
            className="spin"
            size={18}
          />
          Saving...
        </>
      ) : (
        <>
          <Plus size={18} />
          {editing
            ? "Update Content"
            : "Add Content"}
        </>
      )}
    </button>
  );
}

function ContentList({
  items,
  emptyText,
  renderItem,
}) {
  return (
    <div className="content-list">
      {items.map((item) => (
        <article
          className={`content-list-card ${
            item.active === false
              ? "inactive"
              : ""
          }`}
          key={item._id}
        >
          {renderItem(item)}
        </article>
      ))}

      {!items.length && (
        <div className="content-empty">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function ItemActions({
  item,
  onEdit,
  onDelete,
}) {
  return (
    <div className="item-actions">
      <span
        className={
          item.active
            ? "item-active"
            : "item-inactive"
        }
      >
        {item.active ? "Active" : "Hidden"}
      </span>

      <button
        type="button"
        className="icon-button edit"
        onClick={() => onEdit(item)}
        title="Edit"
      >
        <Pencil size={17} />
      </button>

      <button
        type="button"
        className="icon-button delete"
        onClick={onDelete}
        title="Delete"
      >
  
        <Trash2 size={17} />
      </button>
    </div>
  );
}