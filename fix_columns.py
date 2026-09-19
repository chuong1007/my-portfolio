import re

with open('src/components/ProjectDetail.tsx', 'r') as f:
    content = f.read()

# Replace strict equality with loose equality for columns
content = content.replace('project.gallery_columns_mobile === 2', 'project.gallery_columns_mobile == 2')
content = content.replace('project.gallery_columns_mobile === 3', 'project.gallery_columns_mobile == 3')

content = content.replace('project.gallery_columns_tablet === 2', 'project.gallery_columns_tablet == 2')
content = content.replace('project.gallery_columns_tablet === 3', 'project.gallery_columns_tablet == 3')
content = content.replace('project.gallery_columns_tablet === 4', 'project.gallery_columns_tablet == 4')

content = content.replace('project.gallery_columns === 2', 'project.gallery_columns == 2')
content = content.replace('project.gallery_columns === 3', 'project.gallery_columns == 3')
content = content.replace('project.gallery_columns === 5', 'project.gallery_columns == 5')

with open('src/components/ProjectDetail.tsx', 'w') as f:
    f.write(content)
