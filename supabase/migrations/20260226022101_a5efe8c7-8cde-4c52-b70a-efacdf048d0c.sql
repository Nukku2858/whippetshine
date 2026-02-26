
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text,
  customer_email text,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a conversation (no auth needed for customers)
CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (true);

-- Anyone can view their conversation by ID (we'll scope by ID in code)
CREATE POLICY "Anyone can view conversations"
  ON public.chat_conversations FOR SELECT
  USING (true);

-- Admins can update conversation status
CREATE POLICY "Admins can update conversations"
  ON public.chat_conversations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'customer',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages (customers don't have auth)
CREATE POLICY "Anyone can insert messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

-- Anyone can view messages for a conversation
CREATE POLICY "Anyone can view messages"
  ON public.chat_messages FOR SELECT
  USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Auto-update timestamp trigger
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
