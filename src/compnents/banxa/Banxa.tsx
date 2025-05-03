import React from 'react';
import SmallHeading from '../../ui/SmallHeading';
import Heading from '../../ui/Heading';

const Banxa = () => {
  return (
    <div className='p-5 md:p-10 bg-[#222] flex flex-col justify-center' >
    <div className='flex flex-col md:flex-row items-center justify-around gap-5' >
    <div className='shadow-2xl shadow-black rounded-3xl mb-10'>
    <iframe
    className='h-screen w-[500px] rounded-3xl'
      height="1000"
      width="800"
      src = "https://or1.banxa.com/papi/transit/?initId=eyJpdiI6ImlZVzRuaFlNQW0zbmxNK0xVcWRHZHc9PSIsInZhbHVlIjoia3JQQ1hRbjFlaGhMVTMrcHBFbGFrTXRha21MRXIxQ29SeEJYQlNTcE15T21iY25kRVIycGNnTHFaU0Vxc2oxaSthMkN3MTRKeHRGRHJwM2M0YllxcWJvazhBd2tSYVgyM0NBVFk3MG1sSmtMNTZwRHJ5akV3UVBsaDNIbWpGYmdTRk00M1h5VHNRdTV0YmNTcFZQNm5YcFVTa1BJNStzczAwaTBDUGI5Z3Z2M2xmQ3RTV25MMkJFZGJZYWpyY2ppck1FSmU0V1RwMGZFWC9tcWFaZmNyK2dvenNjSGxsck1aNTRoU0locTdhdmlmM05tdjlsNFhsK3RDc04zU0hURm9BSnpNckxMZW5yeWI2Z0xRTjU3eUxqU0xrMzBkTHY4c092ZXBQRVh0T1hsRENNcVhyNUFyU2tFRlVnd1NFSjZZNnBIRzV6N1B3SDkxc0h5NDRPY2pWVnErLzBWeGRJWjlBTGhhaThIS253WHZZZ25ReTFRRmNEOTRJb28rSTg1c2JKS2pTQi9OT2tSRkw2aW1xSDhsQT09IiwibWFjIjoiYmUyMTMwMjU0NDExNzEyYTk3ZDQxNGEwYmI3OGY1NDhjNjJmNjczMTA3NjU5YTg5MmE0NTIxZjU4NjEwODFlMCIsInRhZyI6IiJ9"
      title="Onramp service"
    />
    </div>
    <div className='md:w-[600px] flex flex-col gap-5 md:gap-10'>
    <div className='bg-clip-text my-3 md:my-5 text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 text-2xl md:text-3xl lg:text-5xl font-bold text-center' >
    Global accessibility combined with speed and security. The best of both worlds
      </div>
      <div className='bg-clip-text my-3 md:my-5 text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 text-xl md:text-2xl lg:text-3xl font-bold text-center' >
    All fundraising service charges covered by the platform
      </div>
    </div>
    </div>
    </div>
  );
};

export default Banxa;
