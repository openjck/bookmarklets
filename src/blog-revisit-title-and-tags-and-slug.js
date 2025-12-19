/**
 * This is a work in progress. As you can see, it is only an English description
 * of the algorithm at the moment.
 *
 * Purpose: Revisit and potentially change the title, tags, and slug of a single
 * blog post. I want to do this because I only really got into the habit of
 * using a title halfway through the thoughts migration, and I changed the tags
 * that I use close to the end of the thoughts migration.
 *
 * Steps:
 *
 * 1. Navigate to the current blog post on the write.as domain if we are not on
 *    the write.as domain already.
 * 2. Take note of how many viewers they have been. (This is only shown on the
 *    write.as domain.)
 * 3. Navigate to the edit page for the post (just append "/edit").
 * 4. Insert all tags that are currently being used to the bottom of the post.
 *    Do NOT replace any tags that are already there, since I might want to know
 *    what they were.
 * 5. Allow the user to edit the tags and the title, however they want. Wait for
 *    the user to type some keystroke, like CTRL-something or ALT-something.
 * 6. Verify that there are not two rows of tags, which could happen if I forgot
 *    to delete the old ones. If there are, raise a warning with alert(),
 *    saying that the user should remove the old tags and use the keystroke
 *    again. Once there are not two rows of tags, continue.
 * 9. Publish (save) the page. NOTE: If there have been no changes to any text
 *    on the page, the "Publish" button will not be clickable. In that case, we
 *    should navigate to the view page (remove "/edit") but **still** proceed
 *    with the following steps.
 * 7. Generate a new candidate slug, using the algorithm in the
 *    blog-title-to-slug bookmarklet.
 * 8. **If the new slug would be different**, prompt the user (with
 *    window.confirm) to show them how many viewers there have been, what the
 *    old slug is, and what the new slug would be, asking whether they want the
 *    slug to be changed. If the new slug is the same as the old slug, raise an
 *    alert() saying that.
 * 10. If the user wanted the slug to be changed, visit the meta page (append
 *     "/edit/meta"), modify the slug, and save the form. Then, navigate to the
 *     view of the page (remove "/edit/meta").
 */
