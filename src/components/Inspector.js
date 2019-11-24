import React, { useState, useRef } from "react";

export const Inspector = ({
  nodes,
  subscribed,
  onSetValue,
  onSubscribe,
  onCreateNode,
  onCreateProtectedNode,
  keys,
  onAddKeys
}) => {
  const newSubscription = useRef(null);
  return (
    <div>
      <h1>GUN Data Inspector</h1>
      <h2>Nodes</h2>
      {subscribed.length > 0 && (
        <div className="nodes">
          {subscribed.map(id => (
            <Node
              key={id}
              id={id}
              keys={keys}
              nodes={nodes}
              onSetValue={onSetValue}
              onSubscribe={onSubscribe}
            />
          ))}
        </div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubscribe(newSubscription.current.value, true);
          newSubscription.current.value = "";
        }}
      >
        <input ref={newSubscription} placeholder="insert any GUN id" />
      </form>
      or
      <div>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            onCreateNode();
          }}
        >
          Create new node
        </a>
      </div>
      or
      <div>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            onCreateProtectedNode();
          }}
        >
          Create new protected node
        </a>
      </div>
      <Keys keys={keys} onAddKeys={onAddKeys} />
    </div>
  );
};

export const Node = ({ id, nodes, onSetValue, onSubscribe }) => {
  const node = nodes[id] || {};
  const newKey = useRef(null);
  const newValue = useRef(null);

  return (
    <div className="node">
      <div className="node-id">{`"${id}": {`}</div>
      <div className="node-attributes">
        {Object.keys(node)
          .filter(key => key !== "_")
          .map(key =>
            typeof node[key] === "object" && node[key]["#"] ? (
              <div key={key} className="reference-attribute">
                <div className="key">{`"${key}" ->`}</div>
                <Reference
                  reference={node[key]}
                  onSubscribe={onSubscribe}
                  nodes={nodes}
                  onSetValue={onSetValue}
                />
              </div>
            ) : (
              <div key={key} className="attribute">
                <div className="key">{`"${key}": `}</div>
                <Value
                  value={node[key]}
                  onSetValue={value => onSetValue(id, key, value)}
                />
              </div>
            )
          )}
        <form
          className="new-attribute"
          onSubmit={e => {
            e.preventDefault();
            onSetValue(id, newKey.current.value, newValue.current.value);
            newKey.current.value = "";
            newValue.current.value = "";
          }}
        >
          "
          <input className="new-attribute-key" ref={newKey} placeholder="key" />
          ": "
          <input
            className="new-attribute-value"
            ref={newValue}
            placeholder="value"
          />
          "
          <input type="submit" style={{ visibility: "hidden" }} />
        </form>
      </div>
      <div>}</div>
    </div>
  );
};

const Value = ({ value, onSetValue }) => {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState("");

  return (
    <div
      className="value"
      onDoubleClick={() => {
        if (editing) {
          return;
        }
        setNewValue(value);
        setEditing(true);
      }}
      onKeyDown={e => {
        if (e.keyCode === 27) {
          setEditing(false);
        }
      }}
    >
      "
      {editing ? (
        <form
          className="edit-value"
          onSubmit={e => {
            e.preventDefault();
            onSetValue(newValue);
            setEditing(false);
          }}
        >
          <input
            autoFocus
            className="value-input"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder="value"
          />
        </form>
      ) : typeof value === "object" ? (
        JSON.stringify(value)
      ) : (
        value
      )}
      "
    </div>
  );
};

const Reference = ({ reference, onSubscribe, nodes, onSetValue }) => {
  if (!reference) {
    return <div>deleted</div>;
  }
  const id = reference["#"];
  const [open, setOpen] = useState(false);

  return (
    <div className="reference">
      {open ? (
        <Node
          id={id}
          nodes={nodes}
          onSetValue={onSetValue}
          onSubscribe={onSubscribe}
        />
      ) : (
        <a
          href="#"
          className="reference-link"
          onClick={e => {
            e.preventDefault();
            setOpen(true);
            onSubscribe(id);
          }}
        >
          {id}
        </a>
      )}
    </div>
  );
};

const Keys = ({ keys, onAddKeys }) => {
  const pub = useRef();
  const priv = useRef();

  return (
    <div>
      <h2>Keys</h2>
      {Object.keys(keys).map(key => (
        <div key={key} className="pair">
          <div className="pub">
            <b>Priv:</b> {key}
          </div>
          <div className="priv">
            <b>Pub:</b> {keys[key]}
          </div>
        </div>
      ))}
      <form
        className="add-keys"
        onSubmit={e => {
          e.preventDefault();
          onAddKeys(pub.current.value, priv.current.value);
        }}
      >
        <input ref={pub} placeholder="pub" />
        <input ref={priv} placeholder="priv" />
        <button type="submit">Add key pair</button>
      </form>
    </div>
  );
};
