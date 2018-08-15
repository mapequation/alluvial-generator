const module = row => ({ id: row[0], name: row[1], flow: row[2], exitFlow: row[3] });

const node = row => ({
    path: row[0],
    name: row[1],
    flow: row[2],
    parentPath: row[0].substr(0, row[0].lastIndexOf(":")),
});

const link = row => ({ source: row[0], target: row[1], flow: row[2] });

const sectionTypes = {
    modules: module,
    nodes: node,
    links: link,
};

export const parseMap = rows => {
    const sections = {
        modules: [],
        nodes: [],
        links: [],
    };

    let currentSection = null;

    rows.forEach(row => {
        const first = row[0].toString();

        if (first.startsWith("*")) {
            currentSection = first.substr(1).toLowerCase();
        } else if (currentSection) {
            try {
                sections[currentSection].push(sectionTypes[currentSection](row));
            } catch (err) {
                console.error(err.message);
            }
        }
    });

    return sections;
};
