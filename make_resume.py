from jinja2 import Template
import json
import mistune

with open('resume.json', 'rt') as f:
    resume_data = json.load(f)

with open('resume_jinja.html', 'rt') as f:
    template_str = f.read();

template = Template(template_str)

html = template.render(resume_data)

with open('resume.html', 'wt') as f:
    f.write(html)
