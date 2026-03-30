import { forwardRef } from 'react';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Experience {
  role: string;
  company: string;
  duration: string;
  details: string[];
}

interface Project {
  name: string;
  description: string;
  details?: string[];
}

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  overview?: string; // Optional overview
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certificates?: string[];
}

interface ResumeProps {
  data: ResumeData;
  sectionTextSizes?: {
    header?: number;
    overview?: number; // Font size for Overview section
    education?: number;
    experience?: number;
    projects?: number;
    skills?: number;
    certificates?: number;
  };
}

const ModernTemplate = forwardRef<HTMLDivElement, ResumeProps>(
  ({ data, sectionTextSizes = {} }, ref) => {
    return (
      <div
        ref={ref}
        className='max-w-3xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-lg font-sans'
      >
        {/* Header */}
        <header className='border-b border-slate-300 pb-3 mb-4 text-center'>
          <h1
            style={{ fontSize: sectionTextSizes.header || 24 }}
            className='font-bold text-indigo-700'
          >
            {data.name}
          </h1>
          <p
            style={{
              fontSize: sectionTextSizes.header
                ? sectionTextSizes.header - 6
                : 14,
            }}
            className='text-indigo-600'
          >
            {data.email} | {data.phone}
          </p>
        </header>

        {/* Overview Section */}
        {data.overview && (
          <section className='mb-5'>
            <h2
              style={{ fontSize: sectionTextSizes.overview || 18 }}
              className='font-semibold text-indigo-700 border-b pb-1 mb-2'
            >
              Overview
            </h2>
            <p
              style={{ fontSize: sectionTextSizes.overview || 14 }}
              className='text-indigo-800'
            >
              {data.overview}
            </p>
          </section>
        )}

        {/* Education */}
        <section className='mb-5'>
          <h2
            style={{ fontSize: sectionTextSizes.education || 18 }}
            className='font-semibold text-indigo-700 border-b pb-1 mb-2'
          >
            Education
          </h2>
          {data.education.map((edu, idx) => (
            <p
              key={idx}
              style={{ fontSize: sectionTextSizes.education || 14 }}
              className='text-indigo-800'
            >
              <strong>{edu.degree}</strong>, {edu.institution} ({edu.year})
            </p>
          ))}
        </section>

        {/* Experience */}
        <section className='mb-5'>
          <h2
            style={{ fontSize: sectionTextSizes.experience || 18 }}
            className='font-semibold text-indigo-700 border-b pb-1 mb-2'
          >
            Experience
          </h2>
          {data.experience.map((exp, idx) => (
            <div key={idx} className='mb-2'>
              <p
                style={{ fontSize: sectionTextSizes.experience || 14 }}
                className='font-medium text-indigo-800'
              >
                {exp.role} - {exp.company}{' '}
                <span className='text-indigo-600'>({exp.duration})</span>
              </p>
              <ul
                style={{ fontSize: sectionTextSizes.experience || 14 }}
                className='list-disc list-inside text-indigo-700'
              >
                {exp.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section className='mb-4'>
          <h2
            style={{ fontSize: sectionTextSizes.projects || 16 }}
            className='font-semibold text-indigo-700 border-b pb-1 mb-2'
          >
            Projects
          </h2>
          {data.projects.map((proj, idx) => (
            <div key={idx} className='mb-2'>
              <p
                style={{ fontSize: sectionTextSizes.projects || 14 }}
                className='font-medium'
              >
                {proj.name}
              </p>
              {proj.details && proj.details.length > 0 && (
                <ul
                  style={{ fontSize: sectionTextSizes.projects || 13 }}
                  className='list-disc list-inside ml-4 text-gray-700 mt-1'
                >
                  {proj.details.map((detail, dIdx) => (
                    <li key={dIdx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* Skills */}
        <section className='mb-5'>
          <h2
            style={{ fontSize: sectionTextSizes.skills || 16 }}
            className='font-semibold text-indigo-700 border-b pb-1 mb-2'
          >
            Skills
          </h2>
          <p
            style={{ fontSize: sectionTextSizes.skills || 14 }}
            className='text-indigo-800'
          >
            {data.skills.join(', ')}
          </p>
        </section>

        {/* Certificates */}
        {data.certificates && data.certificates.length > 0 && (
          <section>
            <h2
              style={{ fontSize: sectionTextSizes.certificates || 16 }}
              className='font-semibold text-indigo-700 border-b pb-1 mb-2'
            >
              Certificates
            </h2>
            <ul
              style={{ fontSize: sectionTextSizes.certificates || 14 }}
              className='list-disc list-inside text-indigo-800'
            >
              {data.certificates.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }
);

ModernTemplate.displayName = 'ModernTemplate';
export default ModernTemplate;
