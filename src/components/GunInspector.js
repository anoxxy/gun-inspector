import { Node, Inspector } from "./Inspector";
import React, { useState, useEffect } from "react";

const Gun = require("gun/gun");

const getId = element => element["_"]["#"];

const updateCollection = update => element => {
  const id = getId(element);
  update(collection => ({
    ...collection,
    [id]: element
      ? {
          ...collection[id],
          ...element
        }
      : element
  }));
};

export const GunInspector = ({ initialSubscribed }) => {
  const [gun, setGun] = useState(null);
  const [nodes, setNodes] = useState({});
  const [rootSubscribed, setRootSubscribed] = useState(initialSubscribed);
  const [subscribed, setSubscribed] = useState(initialSubscribed);

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
        gun.get(id).on(updateCollection(setNodes));
      }
    }
  }, [gun]);

  if (!gun) {
    return <div>Loading...</div>;
  }

  return (
    <Inspector
      getId={getId}
      nodes={nodes}
      subscribed={rootSubscribed}
      onSubscribe={(id, root) => {
        if (root && !rootSubscribed.includes(id)) {
          setRootSubscribed([...rootSubscribed, id]);
        }
        if (!subscribed.includes(id)) {
          setSubscribed([...subscribed, id]);
          gun.get(id).on(updateCollection(setNodes));
        }
      }}
      onSetValue={(id, key, value) => {
        console.log(id, key, value);
        gun
          .get(id)
          .get(key)
          .put(value);
      }}
    />
  );
};
