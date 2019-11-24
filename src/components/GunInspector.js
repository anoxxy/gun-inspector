import { Node, Inspector } from "./Inspector";
import React, { useState, useEffect } from "react";

const Gun = require("gun/gun");
const SEA = require("gun/sea");

const getId = element => element["_"]["#"];

const getUUID = gun => gun.opt()._.opt.uuid();

const PROTECTED = /^(.*)~([^@].*)\./;

export const GunInspector = ({ initialSubscribed }) => {
  const [gun, setGun] = useState(null);
  const [rerendered, setRender] = useState({});
  const rerender = () => setRender({});
  const [rootSubscribed, setRootSubscribed] = useState(initialSubscribed);
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [keys, setKeys] = useState({});
  const [nodes, setNodes] = useState({});

  useEffect(() => {
    setGun(
      Gun({
        peers: ["https://gunjs.herokuapp.com/gun"]
      })
    );
  }, []);

  useEffect(() => {
    if (gun) {
      for (const id of subscribed) {
        gun.get(id).on(rerender);
      }
    }
  }, [gun]);

  useEffect(() => {
    if (gun) {
      (async () => {
        const nodes = {};
        for (const id of Object.keys(gun._.graph)) {
          const node = { ...gun._.graph[id] };
          const match = PROTECTED.exec(id);
          if (match) {
            const pub = match[2];
            for (const key of Object.keys(node).filter(
              key => !["_", "pub"].includes(key)
            )) {
              const value = node[key];
              let verified;
              try {
                // gun provides auth values as stringified object ¯\_(ツ)_/¯
                verified = JSON.parse(value);
              } catch (e) {
                console.log(e);
                verified = await SEA.verify(value, pub);
              }
              node[key] = verified[":"];
            }
          }
          nodes[id] = node;
        }
        setNodes(nodes);
      })();
    }
  }, [gun, rerendered]);

  if (!gun) {
    return <div>Loading...</div>;
  }

  return (
    <Inspector
      getId={getId}
      nodes={nodes}
      subscribed={rootSubscribed}
      keys={keys}
      onSubscribe={(id, root) => {
        if (root && !rootSubscribed.includes(id)) {
          setRootSubscribed([...rootSubscribed, id]);
        }
        if (!subscribed.includes(id)) {
          setSubscribed([...subscribed, id]);
          gun.get(id).on(rerender);
        }
      }}
      onSetValue={async (id, key, value) => {
        const match = PROTECTED.exec(id);
        if (match) {
          const pub = match[2];
          const priv = keys[pub];
          if (!priv) {
            return;
          }
          value = await SEA.sign(
            {
              "#": id,
              ".": key,
              ":": value,
              ">": Gun.state()
            },
            { priv, pub }
          );
        }
        gun
          .get(id)
          .get(key)
          .put(value);
      }}
      onCreateNode={() => {
        const id = getUUID(gun);
        setRootSubscribed([...rootSubscribed, id]);
        setSubscribed([...subscribed, id]);
        gun.get(id).on(rerender);
      }}
      onCreateProtectedNode={async () => {
        const { priv, pub } = await SEA.pair();
        const id = `~${pub}`;
        setRootSubscribed([...rootSubscribed, id]);
        setSubscribed([...subscribed, id]);
        setKeys({ ...keys, [pub]: priv });
        gun.get(id).on(rerender);
      }}
    />
  );
};
