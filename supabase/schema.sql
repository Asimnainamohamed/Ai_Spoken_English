create extension if not exists pgcrypto;

create table if not exists public.practice_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  user_input text not null,
  ai_reply text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_lessons (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null unique,
  title text not null,
  sentences jsonb not null default '[]'::jsonb,
  vocabulary jsonb not null default '[]'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.daily_lessons(id) on delete cascade,
  completed boolean not null default false,
  score integer not null default 0 check (score between 0 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists practice_history_user_created_idx
  on public.practice_history (user_id, created_at desc);
create index if not exists user_progress_user_idx
  on public.user_progress (user_id);

alter table public.practice_history enable row level security;
alter table public.daily_lessons enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Users read own practice" on public.practice_history;
create policy "Users read own practice"
  on public.practice_history for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users add own practice" on public.practice_history;
create policy "Users add own practice"
  on public.practice_history for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users read lessons" on public.daily_lessons;
create policy "Authenticated users read lessons"
  on public.daily_lessons for select to authenticated
  using (true);

drop policy if exists "Users read own progress" on public.user_progress;
create policy "Users read own progress"
  on public.user_progress for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users add own progress" on public.user_progress;
create policy "Users add own progress"
  on public.user_progress for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.user_progress;
create policy "Users update own progress"
  on public.user_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.daily_lessons (day_number, title, sentences, vocabulary, quiz)
values
(
  1,
  'Introducing Yourself',
  '["My name is Arun.","I am from Madurai.","I am learning spoken English.","I am a college student.","I work in a small company.","I like reading books.","I can speak Tamil well.","I want to speak English confidently.","Nice to meet you.","Could you tell me about yourself?"]'::jsonb,
  '[{"word":"introduce","meaning":"to tell someone who you are","example":"Let me introduce myself."},{"word":"confident","meaning":"sure about your ability","example":"I want to speak confidently."},{"word":"hobby","meaning":"an activity you enjoy","example":"My hobby is drawing."},{"word":"improve","meaning":"to become better","example":"I practise to improve my English."},{"word":"meet","meaning":"to see someone for the first time","example":"Nice to meet you."}]'::jsonb,
  '[{"question":"Choose the correct sentence.","options":["I am from Chennai.","I from Chennai.","I is from Chennai."],"answer":"I am from Chennai."},{"question":"What is a hobby?","options":["An activity you enjoy","A job interview","A train ticket"],"answer":"An activity you enjoy"},{"question":"Complete: Nice to ___ you.","options":["meet","meeting","met"],"answer":"meet"}]'::jsonb
),
(
  2,
  'Everyday Routine',
  '["I wake up at six o''clock.","I brush my teeth.","I prepare breakfast.","I leave for work at nine.","I travel by bus.","I have lunch with my friends.","I return home in the evening.","I help my family.","I study English for twenty minutes.","I go to bed at ten."]'::jsonb,
  '[{"word":"routine","meaning":"things you do regularly","example":"This is my morning routine."},{"word":"prepare","meaning":"to make something ready","example":"I prepare breakfast."},{"word":"travel","meaning":"to go from one place to another","example":"I travel by train."},{"word":"return","meaning":"to come back","example":"I return home at six."},{"word":"usually","meaning":"on most days","example":"I usually walk to work."}]'::jsonb,
  '[{"question":"Choose the correct habit sentence.","options":["I wakes up early.","I wake up early.","I waking early."],"answer":"I wake up early."},{"question":"Return means:","options":["come back","eat quickly","sleep late"],"answer":"come back"},{"question":"Complete: I travel ___ bus.","options":["by","on a","with"],"answer":"by"}]'::jsonb
),
(
  3,
  'At a Shop',
  '["Excuse me, how much is this shirt?","Do you have this in blue?","I need a smaller size.","Can I try this on?","This fits me well.","That is a little expensive.","Do you have a discount?","I will take this one.","Can I pay by card?","Thank you for your help."]'::jsonb,
  '[{"word":"size","meaning":"how big or small something is","example":"I need a medium size."},{"word":"fit","meaning":"to be the right size","example":"These shoes fit well."},{"word":"discount","meaning":"a lower price","example":"Is there a discount today?"},{"word":"expensive","meaning":"costing a lot of money","example":"This bag is expensive."},{"word":"receipt","meaning":"paper showing what you paid","example":"Please give me the receipt."}]'::jsonb,
  '[{"question":"How do you ask the price?","options":["How much is this?","How many this?","Where price is?"],"answer":"How much is this?"},{"question":"A discount is:","options":["a lower price","a larger size","a colour"],"answer":"a lower price"},{"question":"Complete: Can I pay ___ card?","options":["by","at","from"],"answer":"by"}]'::jsonb
),
(
  4,
  'Interview Basics',
  '["Thank you for this opportunity.","I completed my degree last year.","I am interested in this role.","I am a quick learner.","My strength is teamwork.","I completed a small project.","I can manage my time well.","I am ready to learn new skills.","Could you explain the role?","I look forward to hearing from you."]'::jsonb,
  '[{"word":"opportunity","meaning":"a good chance","example":"Thank you for this opportunity."},{"word":"strength","meaning":"something you do well","example":"Communication is my strength."},{"word":"experience","meaning":"knowledge from doing work","example":"I have sales experience."},{"word":"role","meaning":"a job or responsibility","example":"I am interested in this role."},{"word":"skill","meaning":"an ability you learn","example":"English is an important skill."}]'::jsonb,
  '[{"question":"Choose a polite interview sentence.","options":["Thank you for this opportunity.","Give job to me.","I wanting role."],"answer":"Thank you for this opportunity."},{"question":"Strength means:","options":["something you do well","a mistake","a salary"],"answer":"something you do well"},{"question":"Complete: I am interested ___ this role.","options":["in","on","to"],"answer":"in"}]'::jsonb
),
(
  5,
  'Office Talk',
  '["Good morning, everyone.","I will finish the report today.","Could you send me the file?","I have a small question.","Let us discuss this after lunch.","I need help with this task.","The meeting starts at three.","I will update you soon.","I have completed my work.","Have a good evening."]'::jsonb,
  '[{"word":"task","meaning":"a piece of work","example":"I finished my task."},{"word":"report","meaning":"written information about work","example":"I sent the report."},{"word":"update","meaning":"new information","example":"I will give you an update."},{"word":"discuss","meaning":"to talk about something","example":"Let us discuss the plan."},{"word":"meeting","meaning":"people gathering to talk about work","example":"The meeting is at two."}]'::jsonb,
  '[{"question":"Choose the correct request.","options":["Could you send me the file?","You sending file?","Sended file me."],"answer":"Could you send me the file?"},{"question":"A task is:","options":["a piece of work","a holiday","a bus"],"answer":"a piece of work"},{"question":"Complete: The meeting starts ___ three.","options":["at","in","by the"],"answer":"at"}]'::jsonb
),
(
  6,
  'Phone Conversation',
  '["Hello, may I speak to Priya?","This is Ravi speaking.","Could you speak slowly, please?","I cannot hear you clearly.","Can I call you back?","Please hold for a moment.","She is not available now.","Can I take a message?","I will inform her.","Thank you for calling."]'::jsonb,
  '[{"word":"available","meaning":"free or ready to talk","example":"She is available now."},{"word":"message","meaning":"information for someone","example":"Can I leave a message?"},{"word":"hold","meaning":"wait on the phone","example":"Please hold for a moment."},{"word":"clearly","meaning":"in an easy-to-hear way","example":"Please speak clearly."},{"word":"inform","meaning":"to tell someone","example":"I will inform my manager."}]'::jsonb,
  '[{"question":"What can you say when the sound is poor?","options":["I cannot hear you clearly.","I see your call.","I hearing not."],"answer":"I cannot hear you clearly."},{"question":"Hold means:","options":["wait on the phone","end the call","write an email"],"answer":"wait on the phone"},{"question":"Complete: May I speak ___ Priya?","options":["to","at","by"],"answer":"to"}]'::jsonb
),
(
  7,
  'Asking for Help',
  '["Could you help me, please?","I am looking for the bus stop.","How can I reach the station?","Please show me the way.","Is it far from here?","Go straight for two minutes.","Turn left at the signal.","It is next to the bank.","Thank you very much.","You are welcome."]'::jsonb,
  '[{"word":"reach","meaning":"to arrive at a place","example":"How can I reach the station?"},{"word":"straight","meaning":"without turning","example":"Go straight on this road."},{"word":"signal","meaning":"traffic light","example":"Turn right at the signal."},{"word":"next to","meaning":"beside something","example":"The shop is next to the bank."},{"word":"direction","meaning":"information about where to go","example":"Can you give me directions?"}]'::jsonb,
  '[{"question":"Choose the polite help request.","options":["Could you help me, please?","You help now.","Where go me?"],"answer":"Could you help me, please?"},{"question":"Next to means:","options":["beside","very far","behind time"],"answer":"beside"},{"question":"Complete: Turn left ___ the signal.","options":["at","of","under the"],"answer":"at"}]'::jsonb
)
on conflict (day_number) do update set
  title = excluded.title,
  sentences = excluded.sentences,
  vocabulary = excluded.vocabulary,
  quiz = excluded.quiz;
