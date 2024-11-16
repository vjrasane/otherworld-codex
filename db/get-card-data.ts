import axios from "axios";
import {
    DecoderType,
    array,
    inexact,
    maybe,
    number,
    object,
    optional,
    string,
} from "decoders";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { flow, groupBy, sumBy, trimCharsEnd, uniqBy } from "lodash/fp";
import { dirname, join } from "path";

const Card = inexact({
    code: string,
    faction_code: string,
    faction_name: string,
    type_code: string,
    type_name: string,
    name: string,
    real_name: optional(string),
    encounter_code: optional(string),
    encounter_name: optional(string),
    encounter_position: optional(number),
    position: optional(number),
    text: optional(string),
    flavor: optional(string),
    pack_code: optional(string),
    pack_name: optional(string),
    quantity: maybe(number, 1),
    url: string,
    imagesrc: optional(string),
    backimagesrc: optional(string),
    back_flavor: optional(string),
    traits: optional(string
        .transform((value) => value.split(" "))
        .transform(
            (values) => values.map((value) => value.trim()))
        .transform(
            (values) => values.filter((value) => value.length > 0)
        ).transform(
            values => values.map(value => trimCharsEnd(".", value))
        )
    ),
});

export type Card = DecoderType<typeof Card>;

const EncounterSet = object({
    encounterCode: string,
    encounterName: string,
    packCode: string,
    packName: string,
    cards: array(Card),
    cardCount: number,
});

type EncounterSet = DecoderType<typeof EncounterSet>;

const CARDS_FILE = join(__dirname, "..", ".arkhamdb", "cards.json");

export const getCards = async (): Promise<Card[]> => {
    if (existsSync(CARDS_FILE)) {
        return string
            .transform((value) => JSON.parse(value))
            .then(array(Card).decode)
            .verify(readFileSync(CARDS_FILE, "utf-8"));
    }
    const result = await axios.get(
        "https://arkhamdb.com/api/public/cards?encounter=1"
    );
    const { data } = result;
    const cards = array(Card).verify(data);
    mkdirSync(dirname(CARDS_FILE), { recursive: true });
    writeFileSync(CARDS_FILE, JSON.stringify(cards));
    return cards;
};


export const getEncounterSets = (cards: Card[]): EncounterSet[] => {
    const encounterCards = cards.filter((c) => !!c.encounter_code);
    const grouped = groupBy((c) => c.encounter_code, encounterCards);
    return uniqBy((c) => c.encounter_code, encounterCards)
        .filter((c) => !!c.encounter_code)
        .filter((c) => !!c.pack_code)
        .map((c): EncounterSet => {
            const cards: Card[] =
                (c.encounter_code && grouped[c.encounter_code]) || [];
            return {
                encounterCode: c.encounter_code!,
                encounterName: c.encounter_name!,
                packCode: c.pack_code!,
                packName: c.pack_name!,
                cards,
                cardCount: flow(
                    uniqBy((c: Card) => c.encounter_position),
                    sumBy((c: Card) => c.quantity)
                )(cards),
            };
        })
        .filter((e): e is EncounterSet => EncounterSet.decode(e).ok);
};

