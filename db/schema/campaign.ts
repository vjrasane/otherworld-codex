import { SQL, sql, relations, InferSelectModel, InferInsertModel } from "drizzle-orm"
import { index, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core"
import { tsVector } from "./common"
import { scenario } from "./scenario"
import { pack } from "./pack"

export const campaign = pgTable('campaigns', {
    campaignId: serial('campaign_id').primaryKey(),
    campaignCode: varchar('campaign_code', { length: 255 }).notNull().unique(),
    packCode: varchar('pack_code', { length: 255 }).references(() => pack.packCode, { onDelete: 'cascade' }),
    campaignName: varchar('campaign_name', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    fullTextSearch: tsVector("full_text_search", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${campaign.campaignName}, '')), 'A')
        )`
    )
},
    t => [index('idx_campaign_search').using(
        'gin', t.fullTextSearch
    )]
)

export const campaignRelations = relations(campaign, ({ one, many }) => ({
    pack: one(pack, {
        fields: [campaign.packCode],
        references: [pack.packCode]
    }),
    scenarios: many(scenario)
}))

export type Campaign = InferSelectModel<typeof campaign>;
export type CampaignInput = InferInsertModel<typeof campaign>;