function calculateAge(birthDateString) {
  if (!birthDateString) return null; // * guard clause for empty value
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  if (age <= 0) {
    age = 0;
  }

  return age;
}

export default calculateAge;
