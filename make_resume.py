from jinja2 import Template
import json

with open('resume.json', 'rt') as f:
    resume_data = json.load(f)

template_str = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ name }}'s Resume</title>
</head>
<body>
    {% for job in jobs %}
        <h2>{{ job.company }}</h2>
        <p>{{ job.title }}</p>
    {% endfor %}
</body>
</html>
"""

template = Template(template_str)
html = template.render(resume_data)

with open('resume.html', 'wt') as f:
    f.write(html)
