export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array<number>(right.length + 1).fill(0)
  );

  for (let i = 0; i <= left.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function maxFuzzyDistance(length: number): number {
  if (length < 4) return 0;
  if (length <= 5) return 1;
  if (length <= 8) return 2;
  return 3;
}

function getWordMatchScore(queryWord: string, nameWord: string): number {
  if (!queryWord || !nameWord) return 0;

  if (nameWord === queryWord) return 85;
  if (nameWord.startsWith(queryWord)) return 75;
  if (nameWord.includes(queryWord)) return 65;

  if (queryWord.length >= 4 && nameWord.startsWith(queryWord.slice(0, -1))) return 52;
  if (nameWord.length >= 4 && queryWord.startsWith(nameWord.slice(0, -1))) return 50;

  if (queryWord.length < 4) return 0;

  const distance = levenshteinDistance(queryWord, nameWord);
  const allowedDistance = maxFuzzyDistance(Math.min(queryWord.length, nameWord.length));
  if (distance > allowedDistance) return 0;

  return Math.max(30, 45 - distance * 8);
}

function getBestWordMatchScore(queryWord: string, nameWords: string[]): number {
  return nameWords.reduce((best, nameWord) => Math.max(best, getWordMatchScore(queryWord, nameWord)), 0);
}

export function nameMatchesSearch(name: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const normalizedName = normalizeSearchText(name);
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  const nameWords = normalizedName.split(/\s+/).filter(Boolean);

  return queryWords.every((word) => {
    if (normalizedName.includes(word)) return true;
    return getBestWordMatchScore(word, nameWords) > 0;
  });
}

export function getNameSearchScore(name: string, query: string): number {
  const normalizedName = normalizeSearchText(name);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;

  if (normalizedName === normalizedQuery) return 100;
  if (normalizedName.startsWith(normalizedQuery)) return 90;

  const nameWords = normalizedName.split(/\s+/).filter(Boolean);
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  if (queryWords.length === 1) {
    const word = queryWords[0];
    if (normalizedName.includes(word)) {
      return getBestWordMatchScore(word, nameWords);
    }
    return getBestWordMatchScore(word, nameWords);
  }

  const wordScores = queryWords.map((word) => {
    if (normalizedName.includes(word)) {
      return Math.max(55, getBestWordMatchScore(word, nameWords));
    }
    return getBestWordMatchScore(word, nameWords);
  });

  if (wordScores.every((score) => score > 0)) {
    return Math.min(80, Math.round(wordScores.reduce((sum, score) => sum + score, 0) / queryWords.length));
  }

  return 0;
}

export function registrationMatchesSearch(registrationNumber: string, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query).replace(/[^a-z0-9-]/g, "");
  if (!normalizedQuery) return true;

  const normalizedRegistration = normalizeSearchText(registrationNumber).replace(/[^a-z0-9-]/g, "");
  if (normalizedRegistration.includes(normalizedQuery)) return true;

  if (normalizedQuery.length < 4) return false;

  const distance = levenshteinDistance(normalizedQuery, normalizedRegistration);
  return distance <= maxFuzzyDistance(Math.min(normalizedQuery.length, normalizedRegistration.length));
}

export function getRegistrationSearchScore(registrationNumber: string, query: string): number {
  const normalizedQuery = normalizeSearchText(query).replace(/[^a-z0-9-]/g, "");
  if (!normalizedQuery) return 0;

  const normalizedRegistration = normalizeSearchText(registrationNumber).replace(/[^a-z0-9-]/g, "");

  if (normalizedRegistration === normalizedQuery) return 100;
  if (normalizedRegistration.startsWith(normalizedQuery)) return 90;
  if (normalizedRegistration.includes(normalizedQuery)) return 70;

  if (normalizedQuery.length < 4) return 0;

  const distance = levenshteinDistance(normalizedQuery, normalizedRegistration);
  const allowedDistance = maxFuzzyDistance(
    Math.min(normalizedQuery.length, normalizedRegistration.length)
  );
  if (distance > allowedDistance) return 0;

  return Math.max(25, 40 - distance * 8);
}

export function getMemberSearchScore(
  member: { publicName: string; registrationNumber: string },
  filters: { name?: string; registrationNumber?: string }
): number {
  const nameScore = filters.name ? getNameSearchScore(member.publicName, filters.name) : 0;
  const registrationScore = filters.registrationNumber
    ? getRegistrationSearchScore(member.registrationNumber, filters.registrationNumber)
    : 0;

  return Math.max(nameScore, registrationScore);
}
