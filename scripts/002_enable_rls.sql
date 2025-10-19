-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Teachers policies: teachers can only access their own data
CREATE POLICY "Teachers can view their own profile"
  ON teachers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own profile"
  ON teachers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own profile"
  ON teachers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Students policies: anyone can create students (anonymous), teachers can view their students
CREATE POLICY "Anyone can create students"
  ON students FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Teachers can view their students"
  ON students FOR SELECT
  USING (teacher_id IN (SELECT id FROM teachers WHERE auth.uid() = id));

-- Feedback policies: students can create feedback, teachers can view their students' feedback
CREATE POLICY "Anyone can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Teachers can view their students' feedback"
  ON feedback FOR SELECT
  USING (teacher_id IN (SELECT id FROM teachers WHERE auth.uid() = id));

-- Allow anyone to check if teacher code exists (for student login validation)
CREATE POLICY "Anyone can check teacher codes"
  ON teachers FOR SELECT
  USING (true);
