import { SQL, sql, relations, InferSelectModel } from "drizzle-orm"
import { index, integer, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { tsVector } from "./common"
import { encounterSet } from "./encounter-set"
import { pack } from "./pack"

export const card = pgTable('cards', {
    cardId: serial('card_id').primaryKey(),
    cardName: varchar('card_name', { length: 255 }).notNull(),
    realName: varchar('real_name', { length: 255 }),
    cardCode: varchar('card_code', { length: 255 }).notNull().unique(),
    typeCode: varchar('type_code', { length: 255 }).notNull(),
    typeName: varchar('type_name', { length: 255 }).notNull(),
    factionCode: varchar('faction_code', { length: 255 }).notNull(),
    factionName: varchar('faction_name', { length: 255 }).notNull(),
    encounterPosition: integer('encounter_position'),
    position: integer('position'),
    text: text('text'),
    backText: text('back_text'),
    flavor: text('flavor'),
    traits: text("traits").array(),
    traitsText: text("traits_text"),
    url: text('url').notNull(),
    imagesrc: text('imagesrc'),
    backimagesrc: text('backimagesrc'),
    backflavor: text('back_flavor'),
    rawData: json('raw_data').notNull(),
    encounterCode: varchar('encounter_code', { length: 255 }).references(() => encounterSet.encounterCode, { onDelete: 'cascade' }),
    packCode: varchar('pack_code', { length: 255 }).notNull().references(() => pack.packCode, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    quantity: integer('quantity'),


    // nameSearch: tsVector("name_search", { dimensions: 3 }).generatedAlwaysAs(
    //     (): SQL => sql`setweight(to_tsvector('english', ${card.name}), 'A')`
    // ),
    // contentSearch: tsVector("content_search", { dimensions: 3 }).generatedAlwaysAs(
    //     (): SQL => sql`setweight(to_tsvector('english', coalesce(${card.text}, '') || coalesce(${card.backText}, '')), 'D')`
    // ),
    // traitsSearch: tsVector("traits_search", { dimensions: 3 }).generatedAlwaysAs(
    //     (): SQL => sql`setweight(to_tsvector('english', coalesce(${card.traitsText}, '')), 'B')`
    // )
    fullTextSearch: tsVector("full_text_search", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${card.cardName}, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(${card.realName}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${card.text}, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(${card.backText}, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(${card.traitsText}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${card.flavor}, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(${card.backflavor}, '')), 'D')
        )`
    )

},
    t => [index('idx_card_search').using("gin", t.fullTextSearch)

        // sql`(${t.nameSearch} || ${t.contentSearch})`)
    ]

    //     t => ({
    //         searchIndex: index('card_search_index').using('gin', sql`(
    //    setweight(to_tsvector('english', ${t.name}), 'A') ||
    //    setweight(to_tsvector('english', ${t.realName}), 'A') ||
    //    setweight(to_tsvector('english', ${t.text}), 'B') ||
    //    setweight(to_tsvector('english', ${t.traitsText}), 'C') ||
    //    setweight(to_tsvector('english', ${t.backflavor}), 'D') ||
    //    setweight(to_tsvector('english', ${t.flavor}), 'D')
    //     )`)
    // })
)

export const cardRelations = relations(card, ({ one }) => ({
    encounterSet: one(encounterSet, {
        fields: [card.encounterCode],
        references: [encounterSet.encounterCode]
    }),
    pack: one(pack, {
        fields: [card.packCode],
        references: [pack.packCode]
    })
}))


export type Card = InferSelectModel<typeof card>;