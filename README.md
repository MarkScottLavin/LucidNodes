# LucidNodes
Vision is to develop a 3D graphing library supporting visualization of all graphing possibilities including simple graphs, mindmapping, etc.

Changes: Version 0.1.33 (This version is the first formal public tracking of changes here):

Initial success in viewing LucidNodes Mind Maps in VR (Updated sceneSetup file)

Initial succesful test deployment on Google Cloud
Testing GamePad console
Removed duplicate files in GitHub repo resulting from case-insentitivity
Setup user files serving from remote server and custom app dialog
Created unique .cog and .thm file extensions for cognition (Map) and theme files.
Now saving theme and camera settings with cogntion files
Guides: Load and save with cognition file.
Guides: Refactored selection handling
Guides: Added ability to save guideGroupId and Names
Guides: Fixed ability to save, load and manipulate GuideGroups
Guides: Added vectorGuideLine tool so that a guide can be drawn between two points in 3D space.
Guides: Added Guides toolbar and moved existing guide-related tools to the new toolbar
Created new "lucidNodesEntity" property to simplify handling of situations where both graphElements, guides and potentially other entity types need to be manipulated.
Removed all instances of "doToGraphElementArray()" and numerous for-loops relating to graphElements and guides, and replaced them with Array.forEach() for consistency with JS standard and human readability.
Created lucidNodes-addons directory and migrated experimental features to that directory, to be developed as addons/pro features.
Initial successful experiment in adding custom taxonomies and layers to lucidNodesEntitites.
Refactored Guides so that they are now lucidNodes.Guides of various types.
Added experimental feature of visualizing weighted centroids to nodeArrays
BUG FIX: Added JSON Buffer Size Concatenation so files can now successfully save regardless of size.
BUG FIX: Fixed loading, saving, creating, deleting and manipulating of guideGroups.
