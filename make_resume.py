from jinja2 import Template
import json

with open('resume.json', 'rt') as f:
    resume_data = json.load(f)

template_str = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ name }}'s Resume</title>
    <style>
    body {
      background-color: #f2f2f2;
    }
    </style>
</head>
<body>

<h1>
    {{ name }}
</h1>
<div class="contact">
email: {{ email }}
<br>
{{ location }}
<br>
<hr/>

<div>
    <h2>Experience</h2>
    {% for job in jobs %}
        <h2>{{ job.company }}</h3>
        <p>{{ job.title }}</p>
        <ul>
        {% for detail in job.details  %}
          <li> {{ detail }} </li>
        {% endfor %}
        </ul>
    {% endfor %}

<hr/>
</div>

<div>
    <h2>Education</h2>
    {% for school in education.schools %}
        <h2>{{ school.name }}</h3>
        {{ school.gpa }} GPA
        {% for degree in school.degrees  %}
        <h3> {{ degree.degree }} </h3>
          <ul>
          {% for detail in degree.details  %}
            <li>{{ detail }}</li>
          {% endfor %}
          </ul>
        {% endfor %}
    {% endfor %}
</div>


</body>
</html>
"""

template = Template(template_str)
html = template.render(resume_data)

with open('resume.html', 'wt') as f:
    f.write(html)
