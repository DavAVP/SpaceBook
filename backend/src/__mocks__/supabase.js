// src/__mocks__/supabase.js
const subscriptions = [];

const supabaseMock = {
    from: (table) => ({
        select: () => ({ data: [...subscriptions] }),
        insert: (newSubs) => {
            subscriptions.push(...newSubs);
            return { data: newSubs };
        },
        update: (updateData) => {
            subscriptions.forEach((sub) => Object.assign(sub, updateData));
            return { data: subscriptions };
        },
        delete: () => {
            const removed = subscriptions.splice(0, subscriptions.length);
            return { data: removed };
        },
        eq: function(key, value) {
            const filtered = subscriptions.filter(sub => sub[key] == value);
            return {
                select: () => ({ data: filtered }),
                delete: () => {
                const index = subscriptions.findIndex(sub => sub[key] == value);
                if (index >= 0) return { data: [subscriptions.splice(index, 1)[0]] };
                return { data: [] };
                },
                maybeSingle: () => ({ data: filtered[0] || null }),
            };
        },
        maybeSingle: function() {
            return { data: subscriptions[0] || null };
        },
    })
};

module.exports = supabaseMock;
