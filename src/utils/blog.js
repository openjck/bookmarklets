const writingArea = document.querySelector("textarea#writer");

export const paths = {
  writeAs: "https://write.as/johnkarahalis/",
  johnKarahalis: "https://blog.johnkarahalis.com/",
};

export const tagVocabulary = [
  "#Article",
  "#Favorites",
  "#FiveWordMovieReview",
  "#Life",
  "#Miscellaneous",
  "#PublicNotice",
  "#Quotes",
  "#Recipes",
  "#SocialMedia",
  "#SoftwareDevelopment",
  "#Tech",
  "#TechTips",
];

export function insertTags() {
  // This needs to be done here, not in setRangeText, because if it were done
  // in setRangeText, after the text was inserted, the cursor would move to the
  // the location before any text was inserted, which would be _before_ the
  // linebreaks.
  //
  // It's also worth noting that, in Firefox, for some reason I don't currently
  // understand, if this string were a template literal (`\n\n`), one fewer
  // newline would be inserted. In fact, it seems that all \n characters are
  // collapsed into one when a template literal is used.
  writingArea.value += "\n\n";

  const insertPosition = writingArea.value.length;

  writingArea.setRangeText(
    tagVocabulary.join(" "),
    insertPosition,
    insertPosition,
    "start", // Move the cursor to the beginning of the line with the tags.
  );
}

export function getTitle() {
  const writingAreaText = writingArea.value;
  return writingAreaText.substring(0, writingAreaText.indexOf("\n"));
}
