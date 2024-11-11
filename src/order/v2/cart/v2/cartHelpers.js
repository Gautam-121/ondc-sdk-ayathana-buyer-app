// src/cart/cartHelpers.js
export function getGroupConfig(group) {
    const configTag = group.tags.find(tag => tag.code === "config");
    if (!configTag) return { min: 0, max: 1 };

    const config = { min: 0, max: 1 };
    configTag.list.forEach(item => {
        if (item.code === "min" || item.code === "max") {
            config[item.code] = parseInt(item.value);
        }
    });

    return config;
}

export function isVegItem(item) {
    const vegTag = item.tags.find(tag => tag.code === "veg_nonveg");
    if (!vegTag) return null;

    const vegValue = vegTag.list.find(list => list.code === "veg")?.value;
    const eggValue = vegTag.list.find(list => list.code === "egg")?.value;

    return vegValue === "yes" || vegValue == "Yes";
}

export function getChildGroups(item) {
    const childTags = item.tags.find(tag => tag.code === "child");
    if (!childTags) return [];

    return childTags.list
        .filter(list => list.code === "id")
        .map(list => list.value);
}

export function getRequiredGroups(item, groupsMap) {
    const customGroupTag = item.tags.find(tag => tag.code === "custom_group");
    if (!customGroupTag) return [];

    return customGroupTag.list
        .filter(list => list.code === "id")
        .map(list => list.value)
        .filter(groupId => {
            const group = groupsMap.get(groupId);
            const config = getGroupConfig(group);
            return config.min > 0;
        });
}
