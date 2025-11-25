// src/__mocks__/supabase.js

let subscriptions = [
  { endpoint: "endpoint-1", role: "admin", user_id: "123", p256dh: "key", auth: "auth" },
  { endpoint: "endpoint-2", role: "cliente", user_id: "456", p256dh: "key", auth: "auth" },
];

if (typeof global !== "undefined") {
  global.__supabaseMockSubscriptions = subscriptions;
}

function normalize(val, key) {
  if (val === undefined || val === null) return val;
  if (key === "role") return String(val).toLowerCase().trim();
  if (key === "user_id") return String(val).trim();
  if (key === "endpoint") return String(val).trim();
  return val;
}

function filterData(arr, filters) {
  return arr.filter((sub) =>
    filters.every(([key, value]) => normalize(sub[key], key) === normalize(value, key))
  );
}

function buildChain({ table, filters = [], isDelete = false, data = null } = {}) {
  const _data = data || (table === "push_subscriptions" ? subscriptions.slice() : []);

  function chain(newState) {
    return buildChain({ table, filters, isDelete, data: _data, ...newState });
  }

  return {
    _table: table,
    _filters: filters,
    _data,

    eq(key, value) {
      return chain({ filters: [...filters, [key, value]] });
    },

    select(fields = "*", opts = {}) {
      const filtered = filterData(_data, filters);

      const result = {
        data: filtered,
        count: opts.count === "exact" ? filtered.length : undefined,
        single: () => ({ data: filtered[0] || null }),
        maybeSingle: () => ({ data: filtered[0] || null }),
        eq: (key, value) => chain({ filters: [...filters, [key, value]] }), // ✅ permite encadenar eq()
      };

      if (isDelete) {
        const removed = [];
        filtered.forEach((sub) => {
          const idx = subscriptions.findIndex(
            (s) =>
              normalize(s.endpoint, "endpoint") === normalize(sub.endpoint, "endpoint") &&
              (sub.user_id ? normalize(s.user_id, "user_id") === normalize(sub.user_id, "user_id") : true)
          );
          if (idx >= 0) removed.push(subscriptions.splice(idx, 1)[0]);
        });
        result.data = removed;
        result.count = opts.count === "exact" ? removed.length : undefined;
      }

      return result;
    },

    insert(newSubs) {
      if (table === "push_subscriptions") {
        newSubs.forEach((sub) => {
          const s = { ...sub };
          if (s.userId && !s.user_id) {
            s.user_id = s.userId;
            delete s.userId;
          }
          s.endpoint = normalize(s.endpoint, "endpoint");
          if (s.user_id) s.user_id = normalize(s.user_id, "user_id");
          if (s.role) s.role = normalize(s.role, "role");

          const idx = subscriptions.findIndex(
            (existing) =>
              normalize(existing.endpoint, "endpoint") === s.endpoint &&
              (s.user_id ? normalize(existing.user_id, "user_id") === s.user_id : true)
          );
          if (idx >= 0) subscriptions[idx] = { ...subscriptions[idx], ...s };
          else subscriptions.push(s);
        });
      }
      return { data: newSubs };
    },

    update(updateData) {
      const updated = [];
      _data.forEach((sub) => {
        if (filters.every(([key, value]) => normalize(sub[key], key) === normalize(value, key))) {
          Object.assign(sub, updateData);
          updated.push(sub);
        }
      });
      return { data: updated };
    },

    delete() {
      const toRemove = filterData(subscriptions, filters);
      toRemove.forEach((sub) => {
        const idx = subscriptions.findIndex(
          (s) =>
            normalize(s.endpoint, "endpoint") === normalize(sub.endpoint, "endpoint") &&
            (sub.user_id ? normalize(s.user_id, "user_id") === normalize(sub.user_id, "user_id") : true)
        );
        if (idx >= 0) subscriptions.splice(idx, 1);
      });
      return {
        select: (fields = "*", opts = {}) => ({
          data: toRemove,
          count: opts.count === "exact" ? toRemove.length : undefined,
        }),
      };
    },
  };
}

function from(table) {
  return buildChain({ table });
}

function createClient() {
  return { from };
}

// ✅ utilidad para reiniciar el mock antes de cada test
function resetMock() {
  subscriptions.length = 0;
  subscriptions.push(
    { endpoint: "endpoint-1", role: "admin", user_id: "123", p256dh: "key", auth: "auth" },
    { endpoint: "endpoint-2", role: "cliente", user_id: "456", p256dh: "key", auth: "auth" }
  );
}

module.exports = { from, createClient, resetMock };
