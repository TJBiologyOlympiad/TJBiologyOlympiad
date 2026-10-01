-- Run after schema.sql. Safe to rerun: an existing Biochem: Week 1 is left intact.
with created_week as (
  insert into "POTWWeek" ("topic", "description", "published", "createdById")
  select 'Biochem: Week 1', 'Biochemistry practice questions', true,
    (select "id" from "User" where "username" = '2028efeldman' limit 1)
  where not exists (select 1 from "POTWWeek" where "topic" = 'Biochem: Week 1')
  returning "id"
)
insert into "POTWProblem" ("weekId", "prompt", "choices", "correctIndex", "orderIndex")
select created_week."id", questions.prompt, questions.choices::jsonb, questions.correct_index, questions.order_index
from created_week
cross join (values
  (0, 'Which of the following molecules is used to add fluidity in the cell membrane?', '["Testosterone", "Cholesterol", "Methanol", "Riboflavin"]', 1),
  (1, 'Lactase is the enzyme responsible for lactose digestion. Which of the following is true about lactose?', '["It is a monosaccharide", "Turns the biuret reagent purple", "Turns Benedict''s reagent green", "It is a reducing sugar"]', 3),
  (2, 'Disulfide bridges are a property of which functional group?', '["Amine", "Carboxyl", "Carbonyl", "Thiol"]', 3),
  (3, 'Which of the following amino acids is nonpolar?', '["Asparagine", "Serine", "Glycine", "Glutamine"]', 2),
  (4, 'Cellulose has which type of glycosidic linkage?', '["Beta", "Alpha", "Gamma", "Ionic"]', 0),
  (5, 'A lipid has four fused hydrocarbon rings. Which classification best fits it?', '["Triglyceride", "Steroid", "Polysaccharide", "Polypeptide"]', 1),
  (6, 'The movement of water from the soil to the top of a tall tree is primarily the result of:', '["Active transport of water from xylem vessels into leaf cells", "Active transport of water into xylem vessels", "Higher water potential in leaf cells as compared to root cells", "Root pressure", "Transpiration"]', 4),
  (7, 'Two plant polymers both consist of glucose. One is used primarily for storage and has alpha-linked glucose; the other is used in cell walls and has beta-linked glucose. They are, respectively:', '["Cellulose and starch", "Starch and cellulose", "Chitin and starch", "Glycogen and chitin"]', 1),
  (8, 'The most hydrophobic amino acid is:', '["Leucine", "Isoleucine", "Glycine", "Methionine"]', 1)
) as questions(order_index, prompt, choices, correct_index);

update "POTWWeek"
set "createdById" = (select "id" from "User" where "username" = '2028efeldman' limit 1)
where "topic" = 'Biochem: Week 1' and "createdById" is null
  and exists (select 1 from "User" where "username" = '2028efeldman');
