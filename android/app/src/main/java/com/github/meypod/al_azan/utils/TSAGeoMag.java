package com.github.meypod.al_azan.utils;

// downloaded from https://www.ngdc.noaa.gov/geomag/WMM/thirdpartycontributions.shtml

/*                PUBLIC DOMAIN NOTICE
This program was prepared by Los Alamos National Security, LLC
at Los Alamos National Laboratory (LANL) under contract No.
DE-AC52-06NA25396 with the U.S. Department of Energy (DOE).
All rights in the program are reserved by the DOE and
Los Alamos National Security, LLC.  Permission is granted to the
public to copy and use this software without charge,
provided that this Notice and any statement of authorship are
reproduced on all copies.  Neither the U.S. Government nor LANS
makes any warranty, express or implied, or assumes any liability
or responsibility for the use of this software.
 */

/*           License Statement from the NOAA
The WMM source code is in the public domain and not licensed or
under copyright. The information and software may be used freely
by the public. As required by 17 U.S.C. 403, third parties producing
copyrighted works consisting predominantly of the material produced
by U.S. government agencies must provide notice with such work(s)
identifying the U.S. Government material incorporated and stating
that such material is not subject to copyright protection.
 */

////////////////////////////////////////////////////////////////////////////
//
//GeoMag.java - originally geomag.c
//Ported to Java 1.0.2 by Tim Walker
//tim.walker@worldnet.att.net
//tim@acusat.com
//
//Updated: 1/28/98
//
//Original source geomag.c available at
//http://www.ngdc.noaa.gov/seg/potfld/DoDWMM.html
//
//NOTE: original comments from the geomag.c source file are in ALL CAPS
//Tim's added comments for the port to Java are not
//
////////////////////////////////////////////////////////////////////////////

import android.util.Log;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StreamTokenizer;
import java.util.Calendar;
import java.util.GregorianCalendar;

/**
 * <p>
 *  Last updated on Jan 6, 2020</p><p>
 *  <b>NOTE: </b>Comment out the logger references, and put back in the System.out.println
 *     statements if not using log4j in your application. Checks are not made on the method inputs
 *     to ensure they are within a valid range.</p><p>
 *
 *	Verified by a JUnit test using the test values distributed with the 2020 epoch update.</p><p>
 *
 *	This is a class to generate the magnetic declination,
 *	magnetic field strength and inclination for any point
 *	on the earth.  The true bearing = magnetic bearing + declination.
 * 	This class is adapted from an Applet from the NOAA National Data Center
 *	at <a href ="http://www.ngdc.noaa.gov/seg/segd.shtml"> http://www.ngdc.noaa.gov/seg/segd.shtml.</a>
 * 	None of the calculations
 *	were changed.  This class requires an input file named WMM.COF, which
 *	must be in the same directory that the application is run from. <br>
 *	<b>NOTE:</b> If the WMM.COF file is missing, the internal fit coefficients
 *	for 2020 will be used.
 *
 *	Using the correct date, the declination is accurate to about 0.5 degrees.</p><p>
 *
 *  This is the LANL D-3 version of the GeoMagnetic calculator from
 *	the NOAA National Data Center at http://www.ngdc.noaa.gov/seg/segd.shtml.</p><p>
 *
 *	Adapted by John St. Ledger, Los Alamos National Laboratory
 *	June 25, 1999</p><p>
 *
 *
 *	Version 2 Comments:  The world magnetic model is updated every 5 years.
 *	The data for 2000 uses the same algorithm to calculate the magnetic
 *	field variables.  The only change is in the spherical harmonic coefficients
 *	in the input file.  The input file has been renamed to WMM.COF.  Once again,
 *	the date was fixed.  This time to January 1, 2001.  Also, a deprecated
 *	constructor for StreamTokenizer was replaced, and the error messages in the catch
 *	clause were changed.  Methods to get the field strength and inclination
 *	were added.</p><p>
 *
 *	Found out some interesting information about the altitude. The altitude entered
 *      for the calculations is the height above the WGS84 spheroid, not height MSL. Using
 *      MSL height means that the altitude could be in error by as much as 200 meters.
 *      This should not be significant for our applications.</p>
 *
 *      <p><b>NOTE:</b> This class is not thread safe.</p>
 *
 *
 * @version 3.0 January 19, 2000
 *	<p>Updated for 2000 data.</p>
 *
 * @version 4.0 March 1, 2002
 *	<p>Changed so that if data file doesn't exist,
 *	it uses an internal version of the coefficients from
 *	the 2000 update.</p>
 *
 *
 * @version 5.0 June 1, 2005
 *	<p>Changed so that if data file doesn't exist,
 *	it uses an internal version of the coefficients from
 *	the 2005 update.  Previously, only calculated the declination at sea level
 *	for one date.  Now can return all of the variables as a function of date and
 *	altitude.  Original version used float variables.  All changed to type double.
 *	Does not check if the input date is within the valid block.</p>
 *
 * @version 5.1 June 20, 2005
 *	<p>Fixed a bug discovered by Alvin Liem.  In my zeal to clean up compiler comments
 *	I deleted some double casts for integers that resulted in an integer division
 *	being made when double division was needed.</p>
 *
 *  @version 5.2  June 1, 2006
 *  <p>Took out the input error variable, which was no longer being used.
 *  Now verified with a JUnit test.  Deleted the main() method which printed
 *  a table of test values.</p>
 *
 *  @version 5.3  January 28, 2009
 *  <p>Fixed JavaDoc comments, and replaced the StringTokenizer uses with String.split().
 *
 *  @version 5.4 January 5, 2010
 *  <p>Updated for 2010 data. The new 2010 WMM.COF values are now used. Also, added
 *  <a href ="http://logging.apache.org/log4j/1.2/"> log4j</a> support.</p>
 *
 *  @version 5.5 October 10, 2012
 *  <p>Made minor changes. The default date used when the caller does not input a date is now the epoch + 2.5 years,
 *     rather than being a fixed value. This means that the default date is automatically updated if a new WMM.COF file
 *     is used. Also, now have a method to return the date as a decimal year, given the Gregorian Calendar date.</p>
 *
 *  @version 5.6 January 15, 2015
 *  <p>Updated the internal coefficients to the 2015 values. Passes the new JUnit tests.</p>
 *
 *  @version 5.7 May 26, 2015
 *  <p>Martin Frassl discovered a major bug in the code. I thought that X was in the East direction. It is not. The X axis
 *     is in the North direction. This is now fixed so that getNorthIntensity and getEastIntensity return the correct values.
 *     Thank you Martin!. The X, Y, and Z axes are defined in table 1 of the reference:</p>
 *     <ul>Reference:
 *     <li>Chulliat, A., S. Macmillan, P. Alken, C. Beggan, M. Nair, B. Hamilton, A. Woods, V. Ridley, S. Maus and A. Thomson,
 *     2015, The US/UK World Magnetic Model for 2015-2020: Technical Report, National Geophysical Data Center, NOAA.
 *     doi: 10.7289/V5TB14V7</li></ul>
 *
 *  @version 5.8 April 11, 2019
 *  <p> Updated to use the 2018 update to the 2015 epoch coefficients.
 *
 *  @version 5.9 January 6, 2020
 *  <p>Updated the internal coefficients to the 2020 epoch values. Passes the new JUnit tests.</p>
 *
 *  </li></ul>
 *     <ul>References:
 *
 *       <li>JOHN M. QUINN, DAVID J. KERRIDGE AND DAVID R. BARRACLOUGH,
 *            WORLD MAGNETIC CHARTS FOR 1985 - SPHERICAL HARMONIC
 *            MODELS OF THE GEOMAGNETIC FIELD AND ITS SECULAR
 *            VARIATION, GEOPHYS. J. R. ASTR. SOC. (1986) 87,
 *            PP 1143-1157</li>
 *
 *       <li>DEFENSE MAPPING AGENCY TECHNICAL REPORT, TR 8350.2:
 *            DEPARTMENT OF DEFENSE WORLD GEODETIC SYSTEM 1984,
 *            SEPT. 30 (1987)</li>
 *
 *       <li>JOSEPH C. CAIN, ET AL.; A PROPOSED MODEL FOR THE
 *            INTERNATIONAL GEOMAGNETIC REFERENCE FIELD - 1965,
 *            J. GEOMAG. AND GEOELECT. VOL. 19, NO. 4, PP 335-355
 *            (1967) (SEE APPENDIX)</li>
 *
 *       <li>ALFRED J. ZMUDA, WORLD MAGNETIC SURVEY 1957-1969,
 *            INTERNATIONAL ASSOCIATION OF GEOMAGNETISM AND
 *            AERONOMY (IAGA) BULLETIN #28, PP 186-188 (1971)</li>
 *
 *       <li>JOHN M. QUINN, RACHEL J. COLEMAN, MICHAEL R. PECK, AND
 *            STEPHEN E. LAUBER; THE JOINT US/UK 1990 EPOCH
 *            WORLD MAGNETIC MODEL, TECHNICAL REPORT NO. 304,
 *            NAVAL OCEANOGRAPHIC OFFICE (1991)</li>
 *
 *       <li>JOHN M. QUINN, RACHEL J. COLEMAN, DONALD L. SHIEL, AND
 *            JOHN M. NIGRO; THE JOINT US/UK 1995 EPOCH WORLD
 *            MAGNETIC MODEL, TECHNICAL REPORT NO. 314, NAVAL
 *            OCEANOGRAPHIC OFFICE (1995)</li></ul>
 *
 *
 *
 *
 *     <p>WMM-2000 is a National Imagery and Mapping Agency (NIMA) standard
 *     product. It is covered under NIMA Military Specification:
 *     MIL-W-89500 (1993).
 *
 *     For information on the use and applicability of this product contact</p>
 *
 *                     DIRECTOR<br>
 *                     NATIONAL IMAGERY AND MAPPING AGENCY/HEADQUARTERS<br>
 *                     ATTN: CODE P33<br>
 *                     12310 SUNRISE VALLEY DRIVE<br>
 *                     RESTON, VA 20191-3449<br>
 *                     (703) 264-3002<br>
 *
 *
 *     <p>The FORTRAN version of GEOMAG PROGRAMMED BY:</p>
 *
 *                     JOHN M. QUINN  7/19/90<br>
 *                     FLEET PRODUCTS DIVISION, CODE N342<br>
 *                     NAVAL OCEANOGRAPHIC OFFICE (NAVOCEANO)<br>
 *                     STENNIS SPACE CENTER (SSC), MS 39522-5001<br>
 *                     USA<br>
 *                     PHONE:   COM:  (601) 688-5828<br>
 *                               AV:        485-5828<br>
 *                              FAX:  (601) 688-5521<br>
 *
 *     <p>NOW AT:</p>
 *
 *                     GEOMAGNETICS GROUP<br>
 *                     U. S. GEOLOGICAL SURVEY   MS 966<br>
 *                     FEDERAL CENTER<br>
 *                     DENVER, CO   80225-0046<br>
 *                     USA<br>
 *                     PHONE:   COM: (303) 273-8475<br>
 *                              FAX: (303) 273-8600<br>
 *                     EMAIL:   quinn@ghtmail.cr.usgs.gov<br>
 */
public class TSAGeoMag
{
    /** A logger for this class. Every class MUST have this field, if you want to log from this class.
     *  The class name is the fully qualified class name of the class, such as java.lang.String. If you're not going
     *  to use log4j, then comment all references to the logger, and uncomment the System.***.println statements.*/
    private static String TAG = "TSAGeoMag";

    //variables for magnetic calculations ////////////////////////////////////
    //
    // Variables were identified in geomag.for, the FORTRAN
    // version of the geomag calculator.

    /**	The input string array which contains each line of input for the
     *	wmm.cof input file.  Added so that all data was internal, so that
     *	applications do not have to mess with carrying around a data file.
     *   In the TSAGeoMag Class, the columns in this file are as follows:
     *   n, m,      gnm,      hnm,       dgnm,      dhnm
     */
    private String [] input =
            {       "   2020.0            WMM-2020        12/10/2019",
                    "  1  0  -29404.5       0.0        6.7        0.0",
                    "  1  1   -1450.7    4652.9        7.7      -25.1",
                    "  2  0   -2500.0       0.0      -11.5        0.0",
                    "  2  1    2982.0   -2991.6       -7.1      -30.2",
                    "  2  2    1676.8    -734.8       -2.2      -23.9",
                    "  3  0    1363.9       0.0        2.8        0.0",
                    "  3  1   -2381.0     -82.2       -6.2        5.7",
                    "  3  2    1236.2     241.8        3.4       -1.0",
                    "  3  3     525.7    -542.9      -12.2        1.1",
                    "  4  0     903.1       0.0       -1.1        0.0",
                    "  4  1     809.4     282.0       -1.6        0.2",
                    "  4  2      86.2    -158.4       -6.0        6.9",
                    "  4  3    -309.4     199.8        5.4        3.7",
                    "  4  4      47.9    -350.1       -5.5       -5.6",
                    "  5  0    -234.4       0.0       -0.3        0.0",
                    "  5  1     363.1      47.7        0.6        0.1",
                    "  5  2     187.8     208.4       -0.7        2.5",
                    "  5  3    -140.7    -121.3        0.1       -0.9",
                    "  5  4    -151.2      32.2        1.2        3.0",
                    "  5  5      13.7      99.1        1.0        0.5",
                    "  6  0      65.9       0.0       -0.6        0.0",
                    "  6  1      65.6     -19.1       -0.4        0.1",
                    "  6  2      73.0      25.0        0.5       -1.8",
                    "  6  3    -121.5      52.7        1.4       -1.4",
                    "  6  4     -36.2     -64.4       -1.4        0.9",
                    "  6  5      13.5       9.0       -0.0        0.1",
                    "  6  6     -64.7      68.1        0.8        1.0",
                    "  7  0      80.6       0.0       -0.1        0.0",
                    "  7  1     -76.8     -51.4       -0.3        0.5",
                    "  7  2      -8.3     -16.8       -0.1        0.6",
                    "  7  3      56.5       2.3        0.7       -0.7",
                    "  7  4      15.8      23.5        0.2       -0.2",
                    "  7  5       6.4      -2.2       -0.5       -1.2",
                    "  7  6      -7.2     -27.2       -0.8        0.2",
                    "  7  7       9.8      -1.9        1.0        0.3",
                    "  8  0      23.6       0.0       -0.1        0.0",
                    "  8  1       9.8       8.4        0.1       -0.3",
                    "  8  2     -17.5     -15.3       -0.1        0.7",
                    "  8  3      -0.4      12.8        0.5       -0.2",
                    "  8  4     -21.1     -11.8       -0.1        0.5",
                    "  8  5      15.3      14.9        0.4       -0.3",
                    "  8  6      13.7       3.6        0.5       -0.5",
                    "  8  7     -16.5      -6.9        0.0        0.4",
                    "  8  8      -0.3       2.8        0.4        0.1",
                    "  9  0       5.0       0.0       -0.1        0.0",
                    "  9  1       8.2     -23.3       -0.2       -0.3",
                    "  9  2       2.9      11.1       -0.0        0.2",
                    "  9  3      -1.4       9.8        0.4       -0.4",
                    "  9  4      -1.1      -5.1       -0.3        0.4",
                    "  9  5     -13.3      -6.2       -0.0        0.1",
                    "  9  6       1.1       7.8        0.3       -0.0",
                    "  9  7       8.9       0.4       -0.0       -0.2",
                    "  9  8      -9.3      -1.5       -0.0        0.5",
                    "  9  9     -11.9       9.7       -0.4        0.2",
                    " 10  0      -1.9       0.0        0.0        0.0",
                    " 10  1      -6.2       3.4       -0.0       -0.0",
                    " 10  2      -0.1      -0.2       -0.0        0.1",
                    " 10  3       1.7       3.5        0.2       -0.3",
                    " 10  4      -0.9       4.8       -0.1        0.1",
                    " 10  5       0.6      -8.6       -0.2       -0.2",
                    " 10  6      -0.9      -0.1       -0.0        0.1",
                    " 10  7       1.9      -4.2       -0.1       -0.0",
                    " 10  8       1.4      -3.4       -0.2       -0.1",
                    " 10  9      -2.4      -0.1       -0.1        0.2",
                    " 10 10      -3.9      -8.8       -0.0       -0.0",
                    " 11  0       3.0       0.0       -0.0        0.0",
                    " 11  1      -1.4      -0.0       -0.1       -0.0",
                    " 11  2      -2.5       2.6       -0.0        0.1",
                    " 11  3       2.4      -0.5        0.0        0.0",
                    " 11  4      -0.9      -0.4       -0.0        0.2",
                    " 11  5       0.3       0.6       -0.1       -0.0",
                    " 11  6      -0.7      -0.2        0.0        0.0",
                    " 11  7      -0.1      -1.7       -0.0        0.1",
                    " 11  8       1.4      -1.6       -0.1       -0.0",
                    " 11  9      -0.6      -3.0       -0.1       -0.1",
                    " 11 10       0.2      -2.0       -0.1        0.0",
                    " 11 11       3.1      -2.6       -0.1       -0.0",
                    " 12  0      -2.0       0.0        0.0        0.0",
                    " 12  1      -0.1      -1.2       -0.0       -0.0",
                    " 12  2       0.5       0.5       -0.0        0.0",
                    " 12  3       1.3       1.3        0.0       -0.1",
                    " 12  4      -1.2      -1.8       -0.0        0.1",
                    " 12  5       0.7       0.1       -0.0       -0.0",
                    " 12  6       0.3       0.7        0.0        0.0",
                    " 12  7       0.5      -0.1       -0.0       -0.0",
                    " 12  8      -0.2       0.6        0.0        0.1",
                    " 12  9      -0.5       0.2       -0.0       -0.0",
                    " 12 10       0.1      -0.9       -0.0       -0.0",
                    " 12 11      -1.1      -0.0       -0.0        0.0",
                    " 12 12      -0.3       0.5       -0.1       -0.1"
            };

    /**
     *	Geodetic altitude in km. An input,
     *	but set to zero in this class.  Changed
     *	back to an input in version 5.  If not specified,
     *	then is 0.
     */
    private double alt = 0;

    /**
     *	Geodetic latitude in deg.  An input.
     */
    private double glat = 0;

    /**
     *	Geodetic longitude in deg.  An input.
     */
    private double glon = 0;

    /**
     *	Time in decimal years.  An input.
     */
    private double time = 0;

    /**
     *	Geomagnetic declination in deg.
     *	East is positive, West is negative.
     *	(The negative of variation.)
     */
    private double dec = 0;

    /**
     *	Geomagnetic inclination in deg.
     *	Down is positive, up is negative.
     */
    private double dip = 0;
    /**
     *	Geomagnetic total intensity, in nano Teslas.
     */
    private double ti = 0;

    /**
     *	Geomagnetic grid variation, referenced to
     *	grid North.  Not calculated or output in version 5.0.
     */
    //private double gv = 0;

    /**
     *	The maximum number of degrees of the spherical harmonic model.
     */
    private int maxdeg = 12;

    /**
     *	The maximum order of spherical harmonic model.
     */
    private int maxord;

    /**	Added in version 5.  In earlier versions the date for the calculation was held as a
     *  constant.  Now the default date is set to 2.5 years plus the epoch read from the
     *  input file.
     */
    private double defaultDate = 2022.5;

    /**	Added in version 5.  In earlier versions the altitude for the calculation was held as a
     *  constant at 0.  In version 5, if no altitude is specified in the calculation, this
     * 	altitude is used by default.
     */
    private final double defaultAltitude = 0;

    /**
     *	The Gauss coefficients of main geomagnetic model (nt).
     */
    private double c[][] = new double[13][13];

    /**
     *	The Gauss coefficients of secular geomagnetic model (nt/yr).
     */
    private double cd[][] = new double[13][13];

    /**
     *	The time adjusted geomagnetic gauss coefficients (nt).
     */
    private double tc[][] = new double[13][13];

    /**
     *	The theta derivative of p(n,m) (unnormalized).
     */
    private double dp[][] = new double[13][13];

    /**
     *	The Schmidt normalization factors.
     */
    private double snorm[] = new double[169];

    /**
     *	The sine of (m*spherical coord. longitude).
     */
    private double sp[] = new double[13];

    /**
     *	The cosine of (m*spherical coord. longitude).
     */
    private double cp[] = new double[13];
    private double fn[] = new double[13];
    private double fm[] = new double[13];

    /**
     *	The associated Legendre polynomials for m=1 (unnormalized).
     */
    private double pp[] = new double[13];

    private double k[][] = new double[13][13];

    /**
     * The variables otime (old time), oalt (old altitude),
     * olat (old latitude), olon (old longitude), are used to
     * store the values used from the previous calculation to
     * save on calculation time if some inputs don't change.
     */
    private double otime, oalt, olat, olon;

    /** The date in years, for the start of the valid time of the fit coefficients */
    private double epoch;

    /** bx is the north south field intensity
     *  by is the east west field intensity
     *  bz is the vertical field intensity positive downward
     *  bh is the horizontal field intensity
     */
    private double bx,by,bz,bh;

    /**
     *	re is the Mean radius of IAU-66 ellipsoid, in km.
     *  a2 is the Semi-major axis of WGS-84 ellipsoid, in km, squared.
     *  b2 is the Semi-minor axis of WGS-84 ellipsoid, in km, squared.
     *  c2 is c2 = a2 - b2
     *  a4 is a2 squared.
     *  b4 is b2 squared.
     *  c4 is c4 = a4 - b4.
     */
    private double re,a2,b2,c2,a4,b4,c4;

    private double r,d,ca,sa,ct,st;  // even though these only occur in one method, they must be
    // created here, or won't have correct values calculated
    // These values are only recalculated if the altitude changes.

    //
    ////////////////////////////////////////////////////////////////////////////

    /**
     *	Instantiates object by calling initModel().
     */
    public TSAGeoMag()
    {
        //read model data from file and initialize the GeoMag routine
        initModel();
    }

    /**
     *	Reads data from file and initializes magnetic model.  If
     *	the file is not present, or an IO exception occurs, then the internal
     *	values valid for 2015 will be used. Note that the last line of the
     *	WMM.COF file must be 9999... for this method to read in the input
     *  file properly.
     */
    private void initModel()
    {
        glat = 0;
        glon = 0;
        //bOutDated = false;
        //String strModel = new String();
        //String strFile = new String("WMM.COF");
        //		String strFile = new String("wmm-95.dat");

        // INITIALIZE CONSTANTS
        maxord = maxdeg;
        sp[0] = 0.0;
        cp[0] = snorm[0] = pp[0] = 1.0;
        dp[0][0] = 0.0;
        /**
         *	Semi-major axis of WGS-84 ellipsoid, in km.
         */
        double a = 6378.137;
        /**
         *	Semi-minor axis of WGS-84 ellipsoid, in km.
         */
        double b = 6356.7523142;
        /**
         *	Mean radius of IAU-66 ellipsoid, in km.
         */
        re = 6371.2;
        a2 = a * a;
        b2 = b * b;
        c2 = a2 - b2;
        a4 = a2 * a2;
        b4 = b2 * b2;
        c4 = a4 - b4;

        try{
            //open data file and parse values
            //InputStream is;
            Reader is;

            InputStream input = getClass().getResourceAsStream("WMM.COF");
            if(input == null) throw new FileNotFoundException("WMM.COF not found");
            is = new InputStreamReader(input);
            StreamTokenizer str = new StreamTokenizer(is);


            // READ WORLD MAGNETIC MODEL SPHERICAL HARMONIC COEFFICIENTS
            c[0][0] = 0.0;
            cd[0][0] = 0.0;
            str.nextToken();
            epoch = str.nval;
            defaultDate = epoch + 2.5;
            Log.d(TAG, "TSAGeoMag Epoch is: " + epoch);
            Log.d(TAG,"TSAGeoMag default date is: " + defaultDate);
            str.nextToken();
            //strModel = str.sval;
            str.nextToken();

            //loop to get data from file
            while(true){
                str.nextToken();
                if(str.nval >= 9999)	// end of file
                    break;

                int n = (int)str.nval;
                str.nextToken();
                int m = (int)str.nval;
                str.nextToken();
                double gnm = str.nval;
                str.nextToken();
                double hnm = str.nval;
                str.nextToken();
                double dgnm = str.nval;
                str.nextToken();
                double dhnm = str.nval;

                if (m <= n)
                {
                    c[m][n] = gnm;
                    cd[m][n] = dgnm;

                    if (m != 0)
                    {
                        c[n][m-1] = hnm;
                        cd[n][m-1] = dhnm;
                    }
                }

            }	//while(true)

            is.close();
        }	//try
        // version 2, catch FileNotFound and IO exceptions separately,
        // rather than catching all exceptions.
        // Version 5.4 add logger support, and comment out System.out.println
        catch(FileNotFoundException e)
        {
            String msg = "\nNOTICE      NOTICE      NOTICE      \n" +
                    "WMMCOF file not found in TSAGeoMag.InitModel()\n" +
                    "The input file WMM.COF was not found in the same\n" +
                    "directory as the application.\n" +
                    "The magnetic field components are set to internal values.\n";
            Log.d(TAG, msg + "\n" + e.getMessage());

	    /*            String message = new String(e.toString());

            System.out.println("\nNOTICE      NOTICE      NOTICE      ");
            System.out.println("Error:  " + message);
            System.out.println("Error in TSAGeoMag.InitModel()");
            System.out.println("The input file WMM.COF was not found in the same");
            System.out.println("directory as the application.");
            System.out.println("The magnetic field components are set to internal values.");
	     */
            setCoeff();
        }

        catch(IOException e)
        {
            String msg = "\nNOTICE      NOTICE      NOTICE      \n" +
                    "Problem reading the WMMCOF file in TSAGeoMag.InitModel()\n" +
                    "The input file WMM.COF was found, but there was a problem \n" +
                    "reading the data.\n" +
                    "The magnetic field components are set to internal values.";

            Log.d(TAG, msg + "\n" + e.getMessage());

	    /*            String message = new String(e.toString());
            System.out.println("\nNOTICE      NOTICE      NOTICE      ");
            System.out.println("Error:  " + message);
            System.out.println("Error in TSAGeoMag.InitModel()");
            System.out.println("The input file WMM.COF was found, but there was a problem ");
            System.out.println("reading the data.");
            System.out.println("The magnetic field components are set to internal values.");

	     */
            setCoeff();
        }
        // CONVERT SCHMIDT NORMALIZED GAUSS COEFFICIENTS TO UNNORMALIZED
        snorm[0] = 1.0;
        for (int n = 1; n <= maxord; n++){

            snorm[n] = snorm[n - 1] * (2 * n - 1) / n;
            int j = 2;

            for(int m = 0,D1 = 1,D2 = (n - m + D1) / D1; D2 > 0; D2--, m += D1){
                k[m][n] = (double) (((n - 1) * (n - 1))-(m * m))/(double) ((2 * n-1)*(2*n-3));
                if(m > 0){
                    double flnmj = ((n - m + 1) * j) / (double) (n + m);
                    snorm[n + m * 13] = snorm[n + (m -1 ) * 13] * Math.sqrt(flnmj);
                    j = 1;
                    c[n][m-1] = snorm[n + m * 13] * c[n][m-1];
                    cd[n][m-1] = snorm[n + m * 13] * cd[n][m-1];
                }
                c[m][n] = snorm[n + m * 13] * c[m][n];
                cd[m][n] = snorm[n + m * 13] * cd[m][n];
            }	//for(m...)

            fn[n] = (n+1);
            fm[n] = n;

        }	//for(n...)

        k[1][1] = 0.0;

        otime = oalt = olat = olon = -1000.0;


    }

    /**     <p><b>PURPOSE:</b>  THIS ROUTINE COMPUTES THE DECLINATION (DEC),
     *               INCLINATION (DIP), TOTAL INTENSITY (TI) AND
     *               GRID VARIATION (GV - POLAR REGIONS ONLY, REFERENCED
     *               TO GRID NORTH OF POLAR STEREOGRAPHIC PROJECTION) OF
     *               THE EARTH'S MAGNETIC FIELD IN GEODETIC COORDINATES
     *               FROM THE COEFFICIENTS OF THE CURRENT OFFICIAL
     *               DEPARTMENT OF DEFENSE (DOD) SPHERICAL HARMONIC WORLD
     *               MAGNETIC MODEL (WMM-2010).  THE WMM SERIES OF MODELS IS
     *               UPDATED EVERY 5 YEARS ON JANUARY 1'ST OF THOSE YEARS
     *               WHICH ARE DIVISIBLE BY 5 (I.E. 1980, 1985, 1990 ETC.)
     *               BY THE NAVAL OCEANOGRAPHIC OFFICE IN COOPERATION
     *               WITH THE BRITISH GEOLOGICAL SURVEY (BGS).  THE MODEL
     *               IS BASED ON GEOMAGNETIC SURVEY MEASUREMENTS FROM
     *               AIRCRAFT, SATELLITE AND GEOMAGNETIC OBSERVATORIES.</p><p>
     *
     *
     *
     *     <b>ACCURACY:</b>  IN OCEAN AREAS AT THE EARTH'S SURFACE OVER THE
     *                ENTIRE 5 YEAR LIFE OF A DEGREE AND ORDER 12
     *                SPHERICAL HARMONIC MODEL SUCH AS WMM-95, THE ESTIMATED
     *                RMS ERRORS FOR THE VARIOUS MAGENTIC COMPONENTS ARE:</p>
     *<ul>
     *                DEC  -   0.5 Degrees<br>
     *                DIP  -   0.5 Degrees<br>
     *                TI   - 280.0 nanoTeslas (nT)<br>
     *                GV   -   0.5 Degrees<br></ul>
     *
     *                <p>OTHER MAGNETIC COMPONENTS THAT CAN BE DERIVED FROM
     *                THESE FOUR BY SIMPLE TRIGONOMETRIC RELATIONS WILL
     *                HAVE THE FOLLOWING APPROXIMATE ERRORS OVER OCEAN AREAS:</p>
     *<ul>
     *                X    - 140 nT (North)<br>
     *                Y    - 140 nT (East)<br>
     *                Z    - 200 nT (Vertical)  Positive is down<br>
     *                H    - 200 nT (Horizontal)<br></ul>
     *
     *                <p>OVER LAND THE RMS ERRORS ARE EXPECTED TO BE SOMEWHAT
     *                HIGHER, ALTHOUGH THE RMS ERRORS FOR DEC, DIP AND GV
     *                ARE STILL ESTIMATED TO BE LESS THAN 0.5 DEGREE, FOR
     *                THE ENTIRE 5-YEAR LIFE OF THE MODEL AT THE EARTH's
     *                SURFACE.  THE OTHER COMPONENT ERRORS OVER LAND ARE
     *                MORE DIFFICULT TO ESTIMATE AND SO ARE NOT GIVEN.</p><p>
     *
     *                THE ACCURACY AT ANY GIVEN TIME OF ALL FOUR
     *                GEOMAGNETIC PARAMETERS DEPENDS ON THE GEOMAGNETIC
     *                LATITUDE.  THE ERRORS ARE LEAST AT THE EQUATOR AND
     *                GREATEST AT THE MAGNETIC POLES.</p><p>
     *
     *                IT IS VERY IMPORTANT TO NOTE THAT A DEGREE AND
     *                ORDER 12 MODEL, SUCH AS WMM-2010 DESCRIBES ONLY
     *                THE LONG WAVELENGTH SPATIAL MAGNETIC FLUCTUATIONS
     *                DUE TO EARTH'S CORE.  NOT INCLUDED IN THE WMM SERIES
     *                MODELS ARE INTERMEDIATE AND SHORT WAVELENGTH
     *                SPATIAL FLUCTUATIONS OF THE GEOMAGNETIC FIELD
     *                WHICH ORIGINATE IN THE EARTH'S MANTLE AND CRUST.
     *                CONSEQUENTLY, ISOLATED ANGULAR ERRORS AT VARIOUS
     *                POSITIONS ON THE SURFACE (PRIMARILY OVER LAND, IN
     *                CONTINENTAL MARGINS AND OVER OCEANIC SEAMOUNTS,
     *                RIDGES AND TRENCHES) OF SEVERAL DEGREES MAY BE
     *                EXPECTED. ALSO NOT INCLUDED IN THE MODEL ARE
     *                NONSECULAR TEMPORAL FLUCTUATIONS OF THE GEOMAGNETIC
     *                FIELD OF MAGNETOSPHERIC AND IONOSPHERIC ORIGIN.
     *                DURING MAGNETIC STORMS, TEMPORAL FLUCTUATIONS CAN
     *                CAUSE SUBSTANTIAL DEVIATIONS OF THE GEOMAGNETIC
     *                FIELD FROM MODEL VALUES.  IN ARCTIC AND ANTARCTIC
     *                REGIONS, AS WELL AS IN EQUATORIAL REGIONS, DEVIATIONS
     *                FROM MODEL VALUES ARE BOTH FREQUENT AND PERSISTENT.</p><p>
     *
     *                IF THE REQUIRED DECLINATION ACCURACY IS MORE
     *                STRINGENT THAN THE WMM SERIES OF MODELS PROVIDE, THEN
     *                THE USER IS ADVISED TO REQUEST SPECIAL (REGIONAL OR
     *                LOCAL) SURVEYS BE PERFORMED AND MODELS PREPARED BY
     *                THE USGS, WHICH OPERATES THE US GEOMAGNETIC
     *                OBSERVATORIES.  REQUESTS OF THIS NATURE SHOULD
     *                BE MADE THROUGH NIMA AT THE ADDRESS ABOVE.</p><p>
     *
     *
     *
     *     NOTE:  THIS VERSION OF GEOMAG USES THE WMM-2010 GEOMAGNETIC
     *            MODEL REFERENCED TO THE WGS-84 GRAVITY MODEL ELLIPSOID</p>
     *
     * @param	fLat			The latitude in decimal degrees.
     * @param	fLon			The longitude in decimal degrees.
     * @param	year			The date as a decimal year.
     * @param	altitude		The altitude in kilometers.
     */
    private void calcGeoMag(double fLat, double fLon, double year, double altitude)
    {

        glat =  fLat;
        glon =  fLon;
        alt = altitude;
        /**
         *	The date in decimal years for calculating the magnetic field components.
         */
        time = year;

        double dt = time - epoch;
        //if (otime < 0.0 && (dt < 0.0 || dt > 5.0))
        //		if(bCurrent){
        //			if (dt < 0.0 || dt > 5.0)
        //				bOutDated = true;
        //			else
        //				bOutDated = false;
        //		}

        double pi = Math.PI;
        double dtr = (pi/180.0);
        double rlon = glon * dtr;
        double rlat = glat * dtr;
        double srlon = Math.sin(rlon);
        double srlat = Math.sin(rlat);
        double crlon = Math.cos(rlon);
        double crlat = Math.cos(rlat);
        double srlat2 = srlat * srlat;
        double crlat2 = crlat * crlat;
        sp[1] = srlon;
        cp[1] = crlon;

        // CONVERT FROM GEODETIC COORDS. TO SPHERICAL COORDS.
        if (alt != oalt || glat != olat){
            double q = Math.sqrt(a2 - c2 * srlat2);
            double q1 = alt * q;
            double q2 = ((q1 + a2) / (q1 + b2)) * ((q1 + a2) / (q1 + b2));
            ct = srlat / Math.sqrt(q2 * crlat2 + srlat2);
            st = Math.sqrt(1.0 - (ct * ct));
            double r2 = ((alt*alt) + 2.0 * q1 + (a4 - c4 * srlat2) / (q * q));
            r = Math.sqrt(r2);
            d = Math.sqrt(a2 * crlat2 + b2 * srlat2);
            ca = (alt + d) / r;
            sa = c2 * crlat * srlat / (r * d);
        }
        if (glon != olon){
            for (int m = 2; m <= maxord; m++){
                sp[m] = sp[1] * cp[m-1] + cp[1] * sp[m-1];
                cp[m] = cp[1] * cp[m-1] - sp[1] * sp[m-1];
            }
        }
        double aor = re / r;
        double ar = aor * aor;
        double br = 0, bt = 0, bp = 0, bpp = 0;

        for(int n = 1; n <= maxord; n++){
            ar = ar * aor;
            for (int m = 0,D3 = 1,D4 = (n + m + D3) / D3; D4 > 0; D4--,m += D3){

                //COMPUTE UNNORMALIZED ASSOCIATED LEGENDRE POLYNOMIALS
                //AND DERIVATIVES VIA RECURSION RELATIONS
                if(alt != oalt || glat != olat){
                    if(n == m){
                        snorm[n + m * 13] = st * snorm[n - 1 + (m - 1) * 13];
                        dp[m][n] = st * dp[m-1][n-1]+ ct* snorm[n - 1 + (m - 1) * 13];
                    }
                    if(n == 1 && m == 0){
                        snorm[n + m * 13] = ct * snorm[n - 1 + m * 13];
                        dp[m][n] = ct * dp[m][n - 1] - st * snorm[n - 1 + m * 13];
                    }
                    if(n > 1 && n != m){
                        if(m > n - 2)
                            snorm[n - 2 + m * 13] = 0.0;
                        if(m > n - 2)
                            dp[m][n - 2] = 0.0;
                        snorm[n + m * 13] = ct * snorm[n - 1 + m * 13] - k[m][n] * snorm[n - 2 + m * 13];
                        dp[m][n] = ct * dp[m][n - 1] - st * snorm[n - 1 + m * 13] - k[m][n] * dp[m][n - 2];
                    }
                }

                //TIME ADJUST THE GAUSS COEFFICIENTS

                if(time != otime){
                    tc[m][n] = c[m][n] + dt * cd[m][n];

                    if(m != 0)
                        tc[n][m - 1] = c[n][m - 1]+ dt * cd[n][m - 1];
                }

                //ACCUMULATE TERMS OF THE SPHERICAL HARMONIC EXPANSIONS
                double temp1, temp2;
                double par = ar * snorm[ n + m * 13];
                if(m == 0){
                    temp1 = tc[m][n] * cp[m];
                    temp2 = tc[m][n] * sp[m];
                }
                else{
                    temp1 = tc[m][n] * cp[m] + tc[n][m - 1] * sp[m];
                    temp2 = tc[m][n] * sp[m] - tc[n][m - 1] * cp[m];
                }

                bt = bt - ar * temp1 * dp[m][n];
                bp += (fm[m] * temp2 * par);
                br += (fn[n] * temp1 * par);

                //SPECIAL CASE:  NORTH/SOUTH GEOGRAPHIC POLES

                if(st == 0.0 && m == 1){
                    if(n == 1)
                        pp[n] = pp[n - 1];
                    else
                        pp[n] = ct * pp[n - 1] - k[m][n] * pp[n - 2];
                    double parp = ar * pp[n];
                    bpp += (fm[m] * temp2 * parp);
                }

            }	//for(m...)

        }	//for(n...)


        if(st == 0.0)
            bp = bpp;
        else
            bp /= st;

        //ROTATE MAGNETIC VECTOR COMPONENTS FROM SPHERICAL TO
        //GEODETIC COORDINATES
        // by is the east-west field component
        // bx is the north-south field component
        // bz is the vertical field component.
        bx = -bt * ca - br * sa;
        by = bp;
        bz = bt * sa - br * ca;

        //COMPUTE DECLINATION (DEC), INCLINATION (DIP) AND
        //TOTAL INTENSITY (TI)

        bh = Math.sqrt((bx * bx)+(by * by));
        ti = Math.sqrt((bh * bh)+(bz * bz));
        //	Calculate the declination.
        dec = (Math.atan2(by, bx) / dtr);
        Log.d(TAG, "Dec is: " + dec );
        dip = (Math.atan2(bz, bh) / dtr);

        //	This is the variation for grid navigation.
        //	Not used at this time.  See St. Ledger for explanation.
        //COMPUTE MAGNETIC GRID VARIATION IF THE CURRENT
        //GEODETIC POSITION IS IN THE ARCTIC OR ANTARCTIC
        //(I.E. GLAT > +55 DEGREES OR GLAT < -55 DEGREES)
        // Grid North is referenced to the 0 Meridian of a polar
        // stereographic projection.

        //OTHERWISE, SET MAGNETIC GRID VARIATION TO -999.0
	/*
         gv = -999.0;
         if (Math.abs(glat) >= 55.){
         if (glat > 0.0 && glon >= 0.0)
         gv = dec-glon;
         if (glat > 0.0 && glon < 0.0)
         gv = dec + Math.abs(glon);
         if (glat < 0.0 && glon >= 0.0)
         gv = dec+glon;
         if (glat < 0.0 && glon < 0.0)
         gv = dec - Math.abs(glon);
         if (gv > +180.0)
         gv -= 360.0;
         if (gv < -180.0)
         gv += 360.0;
         }
	 */
        otime = time;
        oalt = alt;
        olat = glat;
        olon = glon;

    }
    /**
     *	Returns the declination from the Department of
     *	Defense geomagnetic model and data, in degrees.  The
     *	magnetic heading + declination = true heading. The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     * 	(True heading + variation = magnetic heading.)
     *
     * @param	dlat	Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  The declination in degrees.
     */
    public double getDeclination( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  dec;
    }
    /**
     *	Returns the declination from the Department of
     *	Defense geomagnetic model and data, in degrees.  The
     *	magnetic heading + declination = true heading.
     * 	(True heading + variation = magnetic heading.)
     *
     * @param	dlat		Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year		The date as a decimal year.
     * @param	altitude	The altitude in kilometers.
     *
     * @return  The declination in degrees.
     */
    public double getDeclination( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  dec;
    }
    /**
     *	Returns the magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla. The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     *
     * @param	dlat	Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  Magnetic field strength in nano Tesla.
     */
    public double getIntensity( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  ti;
    }

    /**
     *	Returns the magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla.
     *
     * @param	dlat	 	Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year		Date of the calculation in decimal years.
     * @param	altitude	Altitude of the calculation in kilometers.
     *
     * @return  Magnetic field strength in nano Tesla.
     */
    public double getIntensity( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  ti;
    }
    /**
     *	Returns the horizontal magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla. The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     *
     * @param	dlat	Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  The horizontal magnetic field strength in nano Tesla.
     */
    public double getHorizontalIntensity( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  bh;
    }

    /**
     *	Returns the horizontal magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla.
     *
     * @param	dlat	 	Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year		Date of the calculation in decimal years.
     * @param	altitude	Altitude of the calculation in kilometers.
     *
     * @return  The horizontal magnetic field strength in nano Tesla.
     */
    public double getHorizontalIntensity( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  bh;
    }
    /**
     *	Returns the vertical magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla. The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     *
     * @param	dlat	Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  The vertical magnetic field strength in nano Tesla.
     */
    public double getVerticalIntensity( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  bz;
    }

    /**
     *	Returns the vertical magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla.
     *
     * @param	dlat	 	Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year		Date of the calculation in decimal years.
     * @param	altitude	Altitude of the calculation in kilometers.
     *
     * @return  The vertical magnetic field strength in nano Tesla.
     */
    public double getVerticalIntensity( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  bz;
    }
    /**
     *	Returns the northerly magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla. The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     *
     * @param	dlat	Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  The northerly component of the magnetic field strength in nano Tesla.
     */
    public double getNorthIntensity( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  bx;
    }

    /**
     *	Returns the northerly magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla.
     *
     * @param	dlat	 	Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year		Date of the calculation in decimal years.
     * @param	altitude	Altitude of the calculation in kilometers.
     *
     * @return  The northerly component of the magnetic field strength in nano Tesla.
     */
    public double getNorthIntensity( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  bx;
    }
    /**
     *	Returns the easterly magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla. The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     *
     * @param	dlat		Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  The easterly component of the magnetic field strength in nano Tesla.
     */
    public double getEastIntensity( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  by;
    }

    /**
     *	Returns the easterly magnetic field intensity from the
     *	Department of Defense geomagnetic model and data
     *	in nano Tesla.
     *
     * @param	dlat	 	Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year		Date of the calculation in decimal years.
     * @param	altitude	Altitude of the calculation in kilometers.
     *
     * @return  The easterly component of the magnetic field strength in nano Tesla.
     */
    public double getEastIntensity( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  by;
    }
    /**
     *	Returns the magnetic field dip angle from the
     *	Department of Defense geomagnetic model and data,
     *	in degrees.  The date and
     *  altitude are the defaults, of half way through the valid
     *  5 year period, and 0 elevation.
     *
     * @param	dlat	Latitude in decimal degrees.
     * @param 	dlong	Longitude in decimal degrees.
     *
     * @return  The magnetic field dip angle, in degrees.
     */
    public double getDipAngle( double dlat, double dlong )
    {
        calcGeoMag( dlat, dlong, defaultDate, defaultAltitude );
        return  dip;
    }

    /**
     *	Returns the magnetic field dip angle from the
     *	Department of Defense geomagnetic model and data,
     *	in degrees.
     *
     * @param	dlat			Latitude in decimal degrees.
     * @param 	dlong		Longitude in decimal degrees.
     * @param	year			Date of the calculation in decimal years.
     * @param	altitude		Altitude of the calculation in kilometers.
     *
     * @return  The magnetic field dip angle, in degrees.
     */
    public double getDipAngle( double dlat, double dlong, double year, double altitude )
    {
        calcGeoMag( dlat, dlong, year, altitude );
        return  dip;
    }

    /**	This method sets the input data to the internal fit coefficents.
     *	If there is an exception reading the input file WMM.COF, these values
     *	are used.
     *
     *  NOTE:  This method is not tested by the JUnit test, unless the WMM.COF file
     *         is missing.
     */
    private void setCoeff()
    {
        c[0][0] = 0.0;
        cd[0][0] = 0.0;

        epoch = Double.parseDouble(input[0].trim().split("[\\s]+")[0]);
        defaultDate = epoch + 2.5;

        String [] tokens;

        //loop to get data from internal values
        for(int i=1; i<input.length; i++)
        {
            tokens = input[i].trim().split("[\\s]+");

            int n = Integer.parseInt(tokens[0]);
            int m = Integer.parseInt(tokens[1]);
            double gnm = Double.parseDouble(tokens[2]);
            double hnm = Double.parseDouble(tokens[3]);
            double dgnm = Double.parseDouble(tokens[4]);
            double dhnm = Double.parseDouble(tokens[5]);

            if (m <= n)
            {
                c[m][n] = gnm;
                cd[m][n] = dgnm;

                if (m != 0)
                {
                    c[n][m-1] = hnm;
                    cd[n][m-1] = dhnm;
                }
            }
        }
    }

    /**<p>
     *   Given a Gregorian Calendar object, this returns the decimal year
     *   value for the calendar, accurate to the day of the input calendar.
     *   The hours, minutes, and seconds of the date are ignored.</p><p>
     *
     *   If the input Gregorian Calendar is new GregorianCalendar(2012, 6, 1), all of
     *   the first of July is counted, and this returns 2012.5. (183 days out of 366)</p><p>
     *
     *   If the input Gregorian Calendar is new GregorianCalendar(2010, 0, 0), the first
     *   of January is not counted, and this returns 2010.0</p><p>
     *
     * @param cal  Has the date (year, month, and day of the month)
     * @return	   The date in decimal years
     */
    public double decimalYear(GregorianCalendar cal)
    {
        int year = cal.get(Calendar.YEAR);
        double daysInYear;
        if(cal.isLeapYear(year))
        {
            daysInYear = 366.0;
        }
        else
        {
            daysInYear = 365.0;
        }

        return year + (cal.get(Calendar.DAY_OF_YEAR))/daysInYear;
    }
}
