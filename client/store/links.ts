import { action, Action, thunk, Thunk } from "easy-peasy";
import axios from "axios";
import query from "query-string";

import { getAxiosConfig } from "../utils";
import { APIv2 } from "../consts";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export interface Link {
  id: string;
  address: string;
  banned: boolean;
  banned_by_id?: number;
  created_at: string;
  link: string;
  domain?: string;
  domain_id?: number;
  password?: string;
  description?: string;
  expire_in?: string;
  target: string;
  updated_at: string;
  user_id?: number;
  visit_count: number;
}

export interface NewLink {
  target: string;
  customurl?: string;
  password?: string;
  domain?: string;
  reuse?: boolean;
  reCaptchaToken?: string;
}

export interface BanLink {
  id: string;
  host?: boolean;
  domain?: boolean;
  user?: boolean;
  userLinks?: boolean;
}

export interface EditLink {
  id: string;
  target: string;
  address: string;
  description?: string;
  expire_in?: string;
}

export interface LinksQuery {
  limit: string;
  skip: string;
  search: string;
  all: boolean;
}

export interface LinksListRes {
  data: Link[];
  total: number;
  limit: number;
  skip: number;
}

export interface Links {
  link?: Link;
  items: Link[];
  total: number;
  loading: boolean;
  submit: Thunk<Links, NewLink>;
  get: Thunk<Links, LinksQuery>;
  add: Action<Links, Link>;
  set: Action<Links, LinksListRes>;
  update: Action<Links, Partial<Link>>;
  remove: Thunk<Links, string>;
  edit: Thunk<Links, EditLink>;
  ban: Thunk<Links, BanLink>;
  setLoading: Action<Links, boolean>;
}

export const links: Links = {
  link: null,
  items: [],
  total: 0,
  loading: true,
  submit: thunk(async (actions, payload) => {
    const data = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== "")
    );
    var res;
    await axios
      .post(APIv2.Links, data, getAxiosConfig())
      .then((_res) => {
        res = _res;
        var _domain = null;
        if (
          !(
            !publicRuntimeConfig.A_DOMAIN ||
            publicRuntimeConfig.A_DOMAIN.length == 0
          )
        ) {
          _domain = publicRuntimeConfig.A_DOMAIN;
        } else {
          _domain = "short.kitkma.com";
        }
        try {
          if (_domain !== null) {
            var _link = res.data.link;
            var ss = _link.split("/", 4);
            res.data.link = `https://${_domain}/${ss[3]}`;
            console.log(res.data.link);
          }
        } catch (e) {
          console.log(e);
        }
      })
      .catch((err) => {});
    actions.add(res.data);
    return res.data;
  }),
  get: thunk(async (actions, payload) => {
    actions.setLoading(true);
    var res;
    await axios
      .get(`${APIv2.Links}?${query.stringify(payload)}`, getAxiosConfig())
      .then((_res) => {
        res = _res;
        var _domain = null;
        console.log(`alternative env variable ${publicRuntimeConfig.A_DOMAIN}`);
        if (
          !(
            !publicRuntimeConfig.A_DOMAIN ||
            publicRuntimeConfig.A_DOMAIN.length == 0
          )
        ) {
          _domain = publicRuntimeConfig.A_DOMAIN;
        } else {
          _domain = "short.kitkma.com";
        }
        console.log(`alternative domain: ${_domain}`);

        try {
          if (_domain !== null) {
            var datatSet = [];
            for (var s of res.data.data) {
              var _link = s.link;
              var ss = _link.split("/", 4);
              s.link = `https://${_domain}/${ss[3]}`;
              console.log(s.link);
              datatSet.push(s);
            }
            res.data.data = datatSet;
          }
        } catch (e) {
          console.log(e);
        }
      })
      .catch((err) => {});

    actions.set(res.data);
    actions.setLoading(false);

    return res.data;
  }),
  remove: thunk(async (actions, id) => {
    await axios.delete(`${APIv2.Links}/${id}`, getAxiosConfig());
  }),
  ban: thunk(async (actions, { id, ...payload }) => {
    const res = await axios.post(
      `${APIv2.Links}/admin/ban/${id}`,
      payload,
      getAxiosConfig()
    );
    actions.update({ id, banned: true });
    return res.data;
  }),
  edit: thunk(async (actions, { id, ...payload }) => {
    var res;
    await axios
      .patch(`${APIv2.Links}/${id}`, payload, getAxiosConfig())
      .then((_res) => {
        res = _res;
        var _domain = null;
        if (
          !(
            !publicRuntimeConfig.A_DOMAIN ||
            publicRuntimeConfig.A_DOMAIN.length == 0
          )
        ) {
          _domain = publicRuntimeConfig.A_DOMAIN;
        } else {
          _domain = "short.kitkma.com";
        }
        try {
          if (_domain !== null) {
            var _link = res.data.link;
            var ss = _link.split("/", 4);
            res.data.link = `https://${_domain}/${ss[3]}`;
            console.log(res.data.link);
          }
        } catch (e) {
          console.log(e);
        }
      })
      .catch((_error) => {});
    actions.update(res.data);
  }),
  add: action((state, payload) => {
    if (state.items.length >= 10) {
      state.items.pop();
    }
    state.items.unshift(payload);
  }),
  set: action((state, payload) => {
    state.items = payload.data;
    state.total = payload.total;
  }),
  update: action((state, payload) => {
    state.items = state.items.map((item) =>
      item.id === payload.id ? { ...item, ...payload } : item
    );
  }),
  setLoading: action((state, payload) => {
    state.loading = payload;
  })
};
