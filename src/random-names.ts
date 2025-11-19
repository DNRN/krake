/**
 * Generates a funny and catchy random name for a working group
 * by combining random adjectives and nouns
 */
export const generateRandomGroupName = (): string => {
    const adjectives = [
        "Smidig", "Modig", "Klog", "Dristig", "Episk", "Vild", "Gigantisk", "Heroisk",
        "Utrolig", "Swingende", "Skarp", "Legendarisk", "Mægtig", "Kvikk", "Optimistisk",
        "Magtfuld", "Hurtig", "Strålende", "Rask", "Titanisk", "Ultimativ", "Livlig",
        "Vittig", "Gæstfri", "Ungdommelig", "Ildfuld", "Fantastisk", "Genial", "Kreativ",
        "Dynamisk", "Energisk", "Fabelagtig", "Genial", "Harmonisk", "Innovativ",
        "Glædelig", "Dødbringende", "Lysende", "Magisk", "Ædel", "Fremragende", "Fænomenal"
    ];

    const nouns = [
        "Alligatorer", "Grævlinge", "Geparder", "Delfiner", "Ørne", "Falke", "Gorillaer",
        "Høge", "Leguaner", "Jaguarer", "Kænguruer", "Løver", "Aber", "Narhvaler",
        "Odder", "Pantere", "Vagtler", "Ravne", "Hajer", "Tigre", "Enhjørninger",
        "Hugorme", "Ulve", "Jordegern", "Yakker", "Zebraer", "Es", "Ildfugle", "Mestre",
        "Drager", "Eliter", "Falke", "Gladiatorer", "Jægere", "Innovatører", "Juggernauter",
        "Riddere", "Legender", "Enspændere", "Ninjaer", "Lovløse", "Pirater", "Kvasarer"
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective} ${noun}`;
};