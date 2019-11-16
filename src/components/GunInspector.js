import { Node, Inspector } from "./Inspector";
import React, { useState, useEffect } from "react";

const Gun = require("gun/gun");

const getId = element => element["_"]["#"];

const useRerender = () => {
  const [, setRender] = useState({});
  const rerender = () => setRender({});
  return rerender;
};

export const GunInspector = ({ initialSubscribed }) => {
  const [gun, setGun] = useState(null);
  const rerender = useRerender();
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
        gun.get(id).on(rerender);
      }
    }
  }, [gun]);

  if (!gun) {
    return <div>Loading...</div>;
  }

  return (
    <Inspector
      getId={getId}
      nodes={gun._.graph}
      subscribed={rootSubscribed}
      onSubscribe={(id, root) => {
        if (root && !rootSubscribed.includes(id)) {
          setRootSubscribed([...rootSubscribed, id]);
        }
        if (!subscribed.includes(id)) {
          setSubscribed([...subscribed, id]);
          gun.get(id).on(rerender);
        }
      }}
      onSetValue={(id, key, value) => {
        gun
          .get(id)
          .get(key)
          .put(value);
      }}
    />
  );
};
